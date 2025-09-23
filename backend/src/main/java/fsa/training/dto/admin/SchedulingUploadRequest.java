package fsa.training.dto.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SchedulingUploadRequest {
    
    @NotNull(message = "Rows cannot be null")
    @NotEmpty(message = "Rows cannot be empty")
    private List<SchedulingRow> rows;
    
    @Data
    public static class SchedulingRow {
        // IDs (preferred)
        private Long theaterId;
        private Long roomId;
        private Long movieId;
        private Long movieRequestId;
        
        // Names (fallback)
        private String theaterName;
        private String roomName;
        private String movieCode;
        private String movieTitle;
        private String showtime;
        private String date;
        private Integer priceStandard;
        private Integer duration;
        private List<String> errors;
        
        public SchedulingRow() {
            this.errors = new java.util.ArrayList<>();
        }
    }
}
