package fsa.training.exception;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        
        int statusCode = status != null ? Integer.parseInt(status.toString()) : 500;
        String errorMessage = message != null ? message.toString() : "Unknown error";
        
        Map<String, Object> error = new HashMap<>();
        error.put("status", statusCode);
        
        if (statusCode == 401) {
            error.put("error", "Unauthorized");
            error.put("message", "Vui lòng đăng nhập để truy cập");
            error.put("code", "UNAUTHORIZED");
        } else if (statusCode == 403) {
            error.put("error", "Forbidden");
            error.put("message", "Bạn không có quyền truy cập trang này");
            error.put("code", "FORBIDDEN");
        } else {
            error.put("error", "Error");
            error.put("message", errorMessage);
        }
        
        return ResponseEntity.status(statusCode).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", 403);
        error.put("error", "Forbidden");
        error.put("message", "Bạn không có quyền truy cập trang này");
        error.put("code", "FORBIDDEN");
        return ResponseEntity.status(403).body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", 401);
        error.put("error", "Unauthorized");
        error.put("message", "Vui lòng đăng nhập để truy cập");
        error.put("code", "UNAUTHORIZED");
        return ResponseEntity.status(401).body(error);
    }
}
