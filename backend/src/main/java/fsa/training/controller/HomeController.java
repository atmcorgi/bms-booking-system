package fsa.training.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Root controller to provide API information when accessing the root path
 */
@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Booking Management System API");
        response.put("version", "1.0");
        response.put("status", "running");
        response.put("endpoints", Map.of(
            "movies", "/api/movies",
            "theaters", "/api/theaters",
            "booking", "/booking/api",
            "auth", "/api/auth"
        ));
        return response;
    }
}

