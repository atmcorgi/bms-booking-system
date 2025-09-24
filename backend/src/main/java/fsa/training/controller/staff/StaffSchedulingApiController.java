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

        // Use unified service (OptaPlanner + stats)
        var result = staffSchedulingService.generatePreview(auth.getName(), startDate, endDate, codes);
        if (result.hasError()) {
            return ResponseEntity.badRequest().body(Map.of("error", result.getError()));
        }

        List<Map<String, Object>> out = new ArrayList<>();
        for (SchedulingUploadDto r : result.getRows()) {
            Map<String, Object> m = new HashMap<>();
            m.put("theaterName", r.getTheaterName());
            m.put("roomName", r.getRoomName());
            m.put("movieCode", r.getMovieCode());
            m.put("showDate", r.getShowDate());
            m.put("showTime", r.getShowTime());
            m.put("priceStandard", r.getPriceStandard());
            m.put("duration", r.getDuration()); // Add duration field
            m.put("errors", r.getErrors());
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
}


