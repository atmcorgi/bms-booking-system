package fsa.training.controller.staff;

import fsa.training.dto.booking.SchedulingUploadDto;
import fsa.training.dto.admin.SchedulingUploadRequest;
import fsa.training.security.TheaterPermissionEvaluator;
import fsa.training.service.scheduling.SchedulingCommitService;
import fsa.training.scheduling.util.SolverProgressHolder;
import fsa.training.service.staff.StaffSchedulingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/staff/scheduling")
public class StaffSchedulingApiController {
    private final SchedulingCommitService schedulingCommitService;
    private final StaffSchedulingService staffSchedulingService;
    private final TheaterPermissionEvaluator permissionEvaluator;

    public StaffSchedulingApiController(SchedulingCommitService schedulingCommitService,
                                        StaffSchedulingService staffSchedulingService,
                                        TheaterPermissionEvaluator permissionEvaluator) {
        this.schedulingCommitService = schedulingCommitService;
        this.staffSchedulingService = staffSchedulingService;
        this.permissionEvaluator = permissionEvaluator;
    }

    @PostMapping("/preview")
    public ResponseEntity<?> preview(@RequestBody Map<String, Object> body, Authentication auth) {
        String startDate = String.valueOf(body.getOrDefault("startDate", ""));
        String endDate = String.valueOf(body.getOrDefault("endDate", ""));
        String codes = body.get("codes") == null ? null : String.valueOf(body.get("codes"));

        // Validate dates
        try {
            java.time.LocalDate.parse(startDate);
            java.time.LocalDate.parse(endDate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Khoảng ngày không hợp lệ"));
        }

        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null || !permissionEvaluator.canManageTheater(auth.getName(), theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        // Parse optional scheduling config from request body
        fsa.training.scheduling.domain.SchedulingConfig config = new fsa.training.scheduling.domain.SchedulingConfig();
        Object configObj = body.get("config");
        if (configObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> cfg = (Map<String, Object>) configObj;
            if (cfg.containsKey("openHour")) config.setOpenHour(toInt(cfg.get("openHour"), 8));
            if (cfg.containsKey("openMinute")) config.setOpenMinute(toInt(cfg.get("openMinute"), 0));
            if (cfg.containsKey("closeHour")) config.setCloseHour(toInt(cfg.get("closeHour"), 23));
            if (cfg.containsKey("closeMinute")) config.setCloseMinute(toInt(cfg.get("closeMinute"), 0));
            if (cfg.containsKey("bufferMinutes")) config.setBufferMinutes(toInt(cfg.get("bufferMinutes"), 5));
            if (cfg.containsKey("timeGrainMinutes")) config.setTimeGrainMinutes(toInt(cfg.get("timeGrainMinutes"), 30));
            if (cfg.containsKey("maxShowsPerMoviePerDay")) config.setMaxShowsPerMoviePerDay(toInt(cfg.get("maxShowsPerMoviePerDay"), 8));
            if (cfg.containsKey("primeTimeWeight")) config.setPrimeTimeWeight(toInt(cfg.get("primeTimeWeight"), 3));
            if (cfg.containsKey("roomBalanceWeight")) config.setRoomBalanceWeight(toInt(cfg.get("roomBalanceWeight"), 2));
        }
        System.out.println("Preview config: " + config);

        // Use unified service (OptaPlanner + stats)
        var result = staffSchedulingService.generatePreview(auth.getName(), startDate, endDate, codes, config);
        if (result.hasError()) {
            return ResponseEntity.badRequest().body(Map.of("error", result.getError()));
        }

        List<Map<String, Object>> out = new ArrayList<>();
        for (SchedulingUploadDto r : result.getRows()) {
            Map<String, Object> m = new HashMap<>();
            // IDs (required for commit)
            m.put("theaterId", r.getTheaterId());
            m.put("roomId", r.getRoomId());
            m.put("movieId", r.getMovieId());
            m.put("movieRequestId", r.getMovieRequestId());
            // Names (for display)
            m.put("theaterName", r.getTheaterName());
            m.put("roomName", r.getRoomName());
            m.put("movieCode", r.getMovieCode());
            // Showtime details
            m.put("showDate", r.getShowDate());
            m.put("showTime", r.getShowTime());
            m.put("priceStandard", r.getPriceStandard());
            m.put("duration", r.getDuration());
            m.put("errors", r.getErrors());
            // Add unique ID for frontend tracking
            m.put("__id", r.getTheaterName() + "_" + r.getRoomName() + "_" + r.getShowDate() + "_" + r.getShowTime());
            out.add(m);
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("rows", out);
        resp.put("total", out.size());
        resp.put("stats", result.getStats());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/commit")
    public ResponseEntity<?> commit(@RequestBody SchedulingUploadRequest request, Authentication auth) {
        List<SchedulingUploadRequest.SchedulingRow> rows = request.getRows();
        
        // Debug log
        System.out.println("DEBUG: Received commit request with " + rows.size() + " rows");
        for (int i = 0; i < Math.min(3, rows.size()); i++) {
            var row = rows.get(i);
            System.out.println("DEBUG: Row " + i + " - theaterId=" + row.getTheaterId() + 
                ", theaterName=" + row.getTheaterName() + 
                ", roomId=" + row.getRoomId() + 
                ", roomName=" + row.getRoomName() + 
                ", movieId=" + row.getMovieId() + 
                ", movieCode=" + row.getMovieCode());
        }

        List<SchedulingUploadDto> commitRows = new ArrayList<>();
        for (SchedulingUploadRequest.SchedulingRow row : rows) {
            SchedulingUploadDto dto = new SchedulingUploadDto();
            
            // Set IDs first (preferred)
            dto.setTheaterId(row.getTheaterId());
            dto.setRoomId(row.getRoomId());
            dto.setMovieId(row.getMovieId());
            dto.setMovieRequestId(row.getMovieRequestId());
            
            // Set names as fallback
            dto.setTheaterName(row.getTheaterName());
            dto.setRoomName(row.getRoomName());
            dto.setMovieCode(row.getMovieCode());
            dto.setShowDate(row.getDate());
            dto.setShowTime(row.getShowtime());
            dto.setPriceStandard(row.getPriceStandard());
            dto.setDuration(row.getDuration());
            
            // Handle errors if needed
            List<String> errs = row.getErrors();
            dto.setErrors(errs);
            commitRows.add(dto);
        }

        // Use scheduling commit service
        SchedulingCommitService.CommitResult result = schedulingCommitService.processCommitSlots(commitRows);
        Map<String, Object> response = new HashMap<>();
        response.put("created", result.getSuccessCount());
        response.put("errors", result.getErrors());
        response.put("errorCount", result.getErrorCount());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getProgress() {
        int currentProgress = SolverProgressHolder.getProgress();
        Map<String, Object> progress = new HashMap<>();
        
        if (currentProgress == 0) {
            progress.put("status", "idle");
            progress.put("percentage", 0);
            progress.put("message", "Chưa bắt đầu tối ưu hóa");
        } else if (currentProgress < 100) {
            progress.put("status", "running");
            progress.put("percentage", currentProgress);
            progress.put("message", "OptaPlanner đang tối ưu hóa...");
        } else {
            progress.put("status", "completed");
            progress.put("percentage", 100);
            progress.put("message", "Hoàn thành tối ưu hóa");
        }
        
        return ResponseEntity.ok(progress);
    }

    private int toInt(Object val, int defaultVal) {
        if (val == null) return defaultVal;
        try { return Integer.parseInt(val.toString()); }
        catch (NumberFormatException e) { return defaultVal; }
    }
}


