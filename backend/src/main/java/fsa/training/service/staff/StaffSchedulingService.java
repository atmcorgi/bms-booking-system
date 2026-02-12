package fsa.training.service.staff;

import fsa.training.dto.booking.SchedulingUploadDto;
import fsa.training.dto.movie.MovieStatusProjection;
import fsa.training.entity.Theater;
import fsa.training.service.scheduling.SchedulingCommitService;
import fsa.training.service.scheduling.SchedulingHelperService;
import fsa.training.service.movie.MovieService;
import fsa.training.service.theater.TheaterService;
import fsa.training.security.TheaterPermissionEvaluator;
import fsa.training.repository.theater.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service để xử lý business logic cho staff scheduling
 */
@Service
public class StaffSchedulingService {

    @Autowired
    private TheaterService theaterService;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private TheaterPermissionEvaluator permissionEvaluator;

    @Autowired
    private SchedulingHelperService schedulingHelperService;
    
    @Autowired
    private SchedulingCommitService schedulingCommitService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private fsa.training.scheduling.service.OptaSchedulingService optaSchedulingService;

    /**
     * Lấy thông tin theater và dữ liệu cần thiết cho upload form
     */
    public SchedulingFormData getSchedulingFormData(String username) {
        // Resolve assigned theater for staff - CHỈ cho phép lập lịch khi đã được gán rạp cụ thể
        final Long assignedId = permissionEvaluator.getAssignedTheaterId(username);
        List<Theater> theaters = theaterService.getTheatersForUser(username);
        Theater myTheater = null;
        
        if (assignedId != null) {
            myTheater = theaters.stream()
                    .filter(t -> t.getId().equals(assignedId))
                    .findFirst()
                    .orElse(null);
        }
        // Week presets
        var presets = schedulingHelperService.getWeekPresets();

        // Get assigned movies for this theater (top 20) to be scheduled
        Long theaterId = myTheater != null ? myTheater.getId() : null;
        List<MovieStatusProjection> assignedMovies = List.of();
        
        if (theaterId != null) {
            Page<MovieStatusProjection> assignedMoviesPage = movieService.getAssignedMoviesByTheater(theaterId, 0, 20);
            assignedMovies = assignedMoviesPage.getContent();
        }

        return new SchedulingFormData(
                myTheater,
                myTheater != null ? myTheater.getId() : null,
                presets.getThisWeekStart().toString(),
                presets.getThisWeekEnd().toString(),
                presets.getNextWeekStart().toString(),
                presets.getNextWeekEnd().toString(),
                assignedMovies
        );
    }

    /**
     * Validate và generate preview data
     */
    public SchedulingPreviewResult generatePreview(String username, String startDate, String endDate, String codes) {
        Long theaterId = permissionEvaluator.getAssignedTheaterId(username);
        
        if (theaterId == null || !permissionEvaluator.canManageTheater(username, theaterId)) {
            return new SchedulingPreviewResult(null, "You don't have permission to manage this theater", java.util.Map.of());
        }
        
        if (!schedulingHelperService.validateDates(startDate, endDate)) {
            return new SchedulingPreviewResult(null, "Khoảng ngày không hợp lệ.", java.util.Map.of());
        }
        
        String codesCsv = (codes != null && !codes.isBlank()) ? codes.trim() : null;
        // Use OptaPlanner solver to propose schedule
        java.time.LocalDate s = java.time.LocalDate.parse(startDate);
        java.time.LocalDate e = java.time.LocalDate.parse(endDate);
        java.util.Set<String> filter = codesCsv == null ? null : new java.util.HashSet<>(java.util.Arrays.asList(codesCsv.split(",")));
        var solution = optaSchedulingService.solve(theaterId, s, e, filter == null ? null : new java.util.ArrayList<>(filter));

        List<SchedulingUploadDto> rows = new java.util.ArrayList<>();
        for (var a : solution.getAssignments()) {
            if (a.getRoom() == null || a.getTimeGrain() == null) {
                System.out.println("DEBUG: Skipping assignment - room=" + a.getRoom() + ", timeGrain=" + a.getTimeGrain());
                continue;
            }
            SchedulingUploadDto dto = new SchedulingUploadDto();
            
            // Set IDs first (preferred)
            dto.setTheaterId(a.getRoom().getTheaterId());
            dto.setRoomId(a.getRoom().getId());
            dto.setMovieId(a.getMovieRequest().getMovie() != null ? a.getMovieRequest().getMovie().getId() : null);
            dto.setMovieRequestId(a.getMovieRequest().getId());
            
            // Set names as fallback
            dto.setTheaterName( getTheaterNameFromRoom(a.getRoom().getTheaterId()) );
            dto.setRoomName(a.getRoom().getName());
            dto.setMovieCode(a.getMovieRequest().getMovieCode());
            
            // Debug log
            System.out.println("DEBUG: Created slot - theaterId=" + dto.getTheaterId() + 
                ", theaterName=" + dto.getTheaterName() + 
                ", roomId=" + dto.getRoomId() + 
                ", roomName=" + dto.getRoomName() + 
                ", movieId=" + dto.getMovieId() + 
                ", movieCode=" + dto.getMovieCode());
            dto.setShowDate(a.getTimeGrain().getDate().toString());
            dto.setShowTime(a.getTimeGrain().getStart().toString());
            
            // Debug log for showDate and showTime
            System.out.println("DEBUG: Set showDate=" + dto.getShowDate() + ", showTime=" + dto.getShowTime());
            dto.setPriceStandard(75000);
            dto.setDuration(a.getMovieRequest().getMovie() != null ? a.getMovieRequest().getMovie().getDuration() : 120);
            
            // Map validation errors
            if (a.getPlanningErrors() != null && !a.getPlanningErrors().isEmpty()) {
                dto.setErrors(new java.util.ArrayList<>(a.getPlanningErrors()));
            }
            
            rows.add(dto);
        }
        
        java.util.Map<String, Object> stats = buildStats(rows);
        if (solution.getScore() != null) {
            stats.put("score", solution.getScore().toString());
        }
        return new SchedulingPreviewResult(rows, null, stats);
    }

    private String getTheaterNameFromRoom(Long theaterId) {
        return theaterRepository.findById(theaterId)
            .map(Theater::getName)
            .orElse(null);
    }

    private java.util.Map<String, Object> buildStats(java.util.List<fsa.training.dto.booking.SchedulingUploadDto> rows) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalShows", rows.size());

        java.util.Map<String, Integer> roomCounts = new java.util.HashMap<>();
        java.util.Map<String, Integer> movieCounts = new java.util.HashMap<>();
        java.util.Map<String, Integer> dayCounts = new java.util.HashMap<>();
        int primeTimeCount = 0;

        for (var r : rows) {
            roomCounts.merge(r.getRoomName(), 1, Integer::sum);
            movieCounts.merge(r.getMovieCode(), 1, Integer::sum);
            dayCounts.merge(r.getShowDate(), 1, Integer::sum);
            try {
                java.time.LocalTime t = java.time.LocalTime.parse(r.getShowTime());
                int h = t.getHour();
                if (h >= 18 && h <= 21) primeTimeCount++;
            } catch (Exception ignored) {}
        }

        stats.put("byRoom", roomCounts);
        stats.put("byMovie", movieCounts);
        stats.put("byDay", dayCounts);
        stats.put("primeTimeCount", primeTimeCount);
        double ratio = rows.isEmpty() ? 0.0 : (double) primeTimeCount / rows.size();
        stats.put("primeTimeRatio", ratio);

        // Balance index: stddev of shows per room (lower is better)
        if (!roomCounts.isEmpty()) {
            double avg = roomCounts.values().stream().mapToInt(i -> i).average().orElse(0);
            double var = roomCounts.values().stream().mapToDouble(i -> (i - avg) * (i - avg)).sum() / roomCounts.size();
            double stddev = Math.sqrt(var);
            stats.put("roomBalanceStddev", stddev);
        }
        return stats;
    }

    /**
     * Lấy preview data với pagination
     */
    public SchedulingPreviewPage getPreviewPage(List<SchedulingUploadDto> rows, int page, int size) {
        Page<SchedulingUploadDto> pageRows = schedulingHelperService.createPagination(rows, page, size);
        return new SchedulingPreviewPage(pageRows.getContent(), pageRows);
    }

    /**
     * Commit scheduling data
     */
    public SchedulingCommitResult commitScheduling(String username, List<SchedulingUploadDto> rows) {
        Long theaterId = permissionEvaluator.getAssignedTheaterId(username);
        
        if (theaterId == null || !permissionEvaluator.canManageTheater(username, theaterId)) {
            return new SchedulingCommitResult(null, "You don't have permission to manage this theater");
        }
        
        // Filter valid rows
        List<SchedulingUploadDto> commitRows = rows.stream()
                .filter(r -> r.getErrors() == null || r.getErrors().isEmpty())
                .collect(java.util.stream.Collectors.toList());
        
        SchedulingCommitService.CommitResult result = schedulingCommitService.processCommitSlots(commitRows);
        
        return new SchedulingCommitResult(result, null);
    }

    // DTOs for data transfer
    public static class SchedulingFormData {
        private final Theater theater;
        private final Long assignedTheaterId;
        private final String thisWeekStart;
        private final String thisWeekEnd;
        private final String nextWeekStart;
        private final String nextWeekEnd;
        private final List<MovieStatusProjection> assignedMovies;

        public SchedulingFormData(Theater theater, Long assignedTheaterId, String thisWeekStart, 
                                String thisWeekEnd, String nextWeekStart, String nextWeekEnd, 
                                List<MovieStatusProjection> assignedMovies) {
            this.theater = theater;
            this.assignedTheaterId = assignedTheaterId;
            this.thisWeekStart = thisWeekStart;
            this.thisWeekEnd = thisWeekEnd;
            this.nextWeekStart = nextWeekStart;
            this.nextWeekEnd = nextWeekEnd;
            this.assignedMovies = assignedMovies;
        }

        // Getters
        public Theater getTheater() { return theater; }
        public Long getAssignedTheaterId() { return assignedTheaterId; }
        public String getThisWeekStart() { return thisWeekStart; }
        public String getThisWeekEnd() { return thisWeekEnd; }
        public String getNextWeekStart() { return nextWeekStart; }
        public String getNextWeekEnd() { return nextWeekEnd; }
        public List<MovieStatusProjection> getAssignedMovies() { return assignedMovies; }
    }

    public static class SchedulingPreviewResult {
        private final List<SchedulingUploadDto> rows;
        private final String error;
        private final java.util.Map<String, Object> stats;

        public SchedulingPreviewResult(List<SchedulingUploadDto> rows, String error, java.util.Map<String, Object> stats) {
            this.rows = rows;
            this.error = error;
            this.stats = stats;
        }

        public List<SchedulingUploadDto> getRows() { return rows; }
        public String getError() { return error; }
        public boolean hasError() { return error != null; }
        public java.util.Map<String, Object> getStats() { return stats; }
    }

    public static class SchedulingPreviewPage {
        private final List<SchedulingUploadDto> content;
        private final Page<SchedulingUploadDto> page;

        public SchedulingPreviewPage(List<SchedulingUploadDto> content, Page<SchedulingUploadDto> page) {
            this.content = content;
            this.page = page;
        }

        public List<SchedulingUploadDto> getContent() { return content; }
        public Page<SchedulingUploadDto> getPage() { return page; }
    }

    public static class SchedulingCommitResult {
        private final SchedulingCommitService.CommitResult result;
        private final String error;

        public SchedulingCommitResult(SchedulingCommitService.CommitResult result, String error) {
            this.result = result;
            this.error = error;
        }

        public SchedulingCommitService.CommitResult getResult() { return result; }
        public String getError() { return error; }
        public boolean hasError() { return error != null; }
    }
}
