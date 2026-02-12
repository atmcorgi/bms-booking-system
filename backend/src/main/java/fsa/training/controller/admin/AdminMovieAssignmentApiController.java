package fsa.training.controller.admin;

import fsa.training.entity.Movie;
import fsa.training.entity.MovieAssignment;
import fsa.training.entity.MovieRequest;
import fsa.training.entity.Theater;
import fsa.training.repository.movie.MovieAssignmentRepository;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.auth.AccountPermissionRepository;
import fsa.training.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/theaters/{theaterId}/movies")
public class AdminMovieAssignmentApiController {

    private static final Logger logger = LoggerFactory.getLogger(AdminMovieAssignmentApiController.class);

    private final MovieAssignmentRepository movieAssignmentRepository;
    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final NotificationService notificationService;
    private final MovieRequestRepository movieRequestRepository;

    public AdminMovieAssignmentApiController(MovieAssignmentRepository movieAssignmentRepository,
                                             TheaterRepository theaterRepository,
                                             MovieRepository movieRepository,
                                             AccountPermissionRepository accountPermissionRepository,
                                             NotificationService notificationService,
                                             MovieRequestRepository movieRequestRepository) {
        this.movieAssignmentRepository = movieAssignmentRepository;
        this.theaterRepository = theaterRepository;
        this.movieRepository = movieRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.notificationService = notificationService;
        this.movieRequestRepository = movieRequestRepository;
    }

    @GetMapping
    public List<Map<String, Object>> list(@PathVariable Long theaterId) {
        return movieAssignmentRepository.findAllWithMovieByTheater(theaterId).stream().map(ma -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", ma.getId());
            m.put("movieId", ma.getMovie().getId());
            m.put("movieCode", ma.getMovie().getCode());
            m.put("title", ma.getMovie().getTitle());
            m.put("posterUrl", ma.getMovie().getPosterUrl());
            m.put("duration", ma.getMovie().getDuration());
            m.put("director", ma.getMovie().getDirector());
            m.put("activeFrom", ma.getActiveFrom());
            m.put("activeTo", ma.getActiveTo());
            m.put("formats", ma.getFormats());
            m.put("languages", ma.getLanguages());
            return m;
        }).collect(Collectors.toList());
    }

    @PostMapping("/assign")
    @Transactional
    public ResponseEntity<?> assign(@PathVariable Long theaterId, @RequestBody Map<String, Object> body) {
        String movieCode = String.valueOf(body.get("movieCode"));
        LocalDate activeFrom = parseDate(body.get("activeFrom"));
        LocalDate activeTo = parseDate(body.get("activeTo"));
        String formats = body.get("formats") != null ? String.valueOf(body.get("formats")) : null;
        String languages = body.get("languages") != null ? String.valueOf(body.get("languages")) : null;

        Theater theater = theaterRepository.findById(theaterId).orElseThrow();
        Movie movie = movieRepository.findByCode(movieCode).orElseThrow();

        MovieAssignment ma = movieAssignmentRepository.findFirstByTheater_IdAndMovie_Id(theaterId, movie.getId())
                .orElseGet(MovieAssignment::new);
        ma.setTheater(theater);
        ma.setMovie(movie);
        ma.setActiveFrom(activeFrom);
        ma.setActiveTo(activeTo);
        ma.setFormats(formats);
        ma.setLanguages(languages);
        movieAssignmentRepository.save(ma);

        // --- CORRECT WORKFLOW LOGIC ---
        // Automatically create a PENDING MovieRequest for the staff to take action on.
        movieRequestRepository.findFirstByMovie_CodeAndTheater_Id(movie.getCode(), theaterId)
                .ifPresentOrElse(
                        (existingRequest) -> logger.info("MovieRequest for movie '{}' at theater '{}' already exists. Skipping creation.", movie.getTitle(), theater.getName()),
                        () -> {
                            MovieRequest movieRequest = new MovieRequest();
                            movieRequest.setMovie(movie);
                            movieRequest.setMovieCode(movie.getCode());
                            movieRequest.setTheater(theater);
                            movieRequest.setStatus("PENDING");
                            movieRequest.setCreatedBy("ADMIN_ASSIGNMENT");
                            movieRequestRepository.save(movieRequest);
                            logger.info("✅ Automatically created PENDING MovieRequest for movie '{}' at theater '{}'.", movie.getTitle(), theater.getName());
                        }
                );
        // --- END CORRECT WORKFLOW LOGIC ---


        // Get staff usernames for this theater
        List<String> staff = accountPermissionRepository.findByAssignedTheaterId(theaterId).stream()
                .map(ap -> ap.getAccount().getUsername()).toList();

        // Create notifications for all staff members
        if (!staff.isEmpty()) {
            String assignedBy = SecurityContextHolder.getContext().getAuthentication().getName();
            notificationService.createMovieAssignmentNotificationsForMultipleStaff(
                    movie.getTitle(),
                    theater.getName(),
                    assignedBy,
                    staff,
                    movie.getId(),
                    theaterId
            ).thenAccept(notifications -> {
                logger.info("✅ Đã tạo {} notifications cho staff của rạp {}", notifications.size(), theater.getName());
            }).exceptionally(throwable -> {
                logger.error("❌ Lỗi khi tạo notifications cho rạp {}: {}", theater.getName(), throwable.getMessage(), throwable);
                return null;
            });
        }

        java.util.Map<String, Object> ok = new java.util.HashMap<>();
        ok.put("success", true);
        ok.put("notified", staff);
        ok.put("notificationCount", staff.size());
        return ResponseEntity.ok(ok);
    }

    @PostMapping("/bulk")
    @Transactional
    public ResponseEntity<?> assignBulk(@PathVariable Long theaterId, @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> movieCodes = (List<String>) body.get("movieCodes");
        LocalDate activeFrom = parseDate(body.get("activeFrom"));
        LocalDate activeTo = parseDate(body.get("activeTo"));
        String formats = body.get("formats") != null ? String.valueOf(body.get("formats")) : null;
        String languages = body.get("languages") != null ? String.valueOf(body.get("languages")) : null;

        if (movieCodes == null || movieCodes.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Danh sách phim không được để trống"));
        }

        Theater theater = theaterRepository.findById(theaterId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy rạp"));
        int successCount = 0;

        for (String code : movieCodes) {
            try {
                Movie movie = movieRepository.findByCode(code).orElse(null);
                if (movie == null) continue;

                MovieAssignment ma = movieAssignmentRepository.findFirstByTheater_IdAndMovie_Id(theaterId, movie.getId())
                        .orElseGet(MovieAssignment::new);
                ma.setTheater(theater);
                ma.setMovie(movie);
                ma.setActiveFrom(activeFrom);
                ma.setActiveTo(activeTo);
                ma.setFormats(formats);
                ma.setLanguages(languages);
                movieAssignmentRepository.save(ma);

                // Create Pending Request
                movieRequestRepository.findFirstByMovie_CodeAndTheater_Id(movie.getCode(), theaterId)
                        .ifPresentOrElse(
                                (existing) -> {},
                                () -> {
                                    MovieRequest req = new MovieRequest();
                                    req.setMovie(movie);
                                    req.setMovieCode(movie.getCode());
                                    req.setTheater(theater);
                                    req.setStatus("PENDING");
                                    req.setCreatedBy("ADMIN_ASSIGNMENT_BULK");
                                    movieRequestRepository.save(req);
                                }
                        );
                successCount++;
            } catch (Exception e) {
                logger.error("Error assigning movie {} to theater {}", code, theater.getName(), e);
            }
        }

        // Notify staff (bulk)
        List<String> staff = accountPermissionRepository.findByAssignedTheaterId(theaterId).stream()
                .map(ap -> ap.getAccount().getUsername()).toList();
        
        if (!staff.isEmpty() && successCount > 0) {
            String assignedBy = SecurityContextHolder.getContext().getAuthentication().getName();
             notificationService.createNotificationsForMultipleUsers(
                "Thông báo gán phim hàng loạt",
                "Quản trị viên " + assignedBy + " vừa gán " + successCount + " phim cho rạp " + theater.getName(),
                fsa.training.entity.Notification.NotificationType.MOVIE_ASSIGNED,
                staff,
                null,
                theaterId
             );
        }

        return ResponseEntity.ok(Map.of("success", true, "count", successCount));
    }

    @DeleteMapping("/{movieCode}")
    @Transactional
    public ResponseEntity<?> unassign(@PathVariable Long theaterId, @PathVariable String movieCode) {
        Movie movie = movieRepository.findByCode(movieCode).orElseThrow();
        // Delete MovieAssignment
        movieAssignmentRepository.findFirstByTheater_IdAndMovie_Id(theaterId, movie.getId())
                .ifPresent(movieAssignmentRepository::delete);

        // Also delete the corresponding MovieRequest
        movieRequestRepository.findFirstByMovie_CodeAndTheater_Id(movie.getCode(), theaterId)
                .ifPresent(movieRequest -> {
                    movieRequestRepository.delete(movieRequest);
                    logger.info("✅ Automatically deleted MovieRequest for movie '{}' at theater ID {}.", movie.getTitle(), theaterId);
                });

        java.util.Map<String, Object> ok = new java.util.HashMap<>();
        ok.put("success", true);
        return ResponseEntity.ok(ok);
    }

    private LocalDate parseDate(Object v) {
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        if (s.isEmpty()) return null;
        return LocalDate.parse(s);
    }
    @GetMapping("/available")
    public Map<String, Object> listAvailable(@PathVariable Long theaterId, 
                                            @RequestParam(value = "q", required = false) String q,
                                            @RequestParam(value = "page", defaultValue = "0") int page,
                                            @RequestParam(value = "size", defaultValue = "10") int size) {
         org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
         org.springframework.data.domain.Page<Movie> paged = movieRepository.findUnassignedMoviesByTheater(theaterId, q, pageable);
         
         return Map.of(
            "items", paged.getContent().stream().map(this::toMovieRaw).collect(Collectors.toList()),
            "page", paged.getNumber(),
            "size", paged.getSize(),
            "totalPages", paged.getTotalPages(),
            "totalItems", paged.getTotalElements()
         );
    }
    
    private Map<String, Object> toMovieRaw(Movie m) {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", m.getId());
        map.put("title", m.getTitle());
        map.put("code", m.getCode());
        map.put("posterUrl", m.getPosterUrl());
        map.put("duration", m.getDuration());
        return map;
    }
}


