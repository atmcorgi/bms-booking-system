package fsa.training.dto.auth;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private String message;
    private LocalDateTime timestamp;
    private List<String> errors;
    
    public ErrorResponse(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    
    public ErrorResponse(String message, List<String> errors) {
        this.message = message;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }
}

