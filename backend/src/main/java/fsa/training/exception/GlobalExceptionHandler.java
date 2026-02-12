package fsa.training.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        e.printStackTrace();
        String message = "Database constraint violation: " + e.getMostSpecificCause().getMessage();
        return ResponseEntity.status(HttpStatus.CONFLICT) // 409 Conflict
                .body(Map.of("message", message, "error", "DataIntegrityViolation"));
    }

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<?> handleAllExceptions(Throwable e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "message", "An unexpected error occurred: " + e.getMessage(), 
                        "error", e.getClass().getSimpleName(),
                        "details", e.getCause() != null ? e.getCause().getMessage() : "No cause"
                ));
    }
}
