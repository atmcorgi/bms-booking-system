package fsa.training.controller.auth;

import fsa.training.security.jwt.TokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;

    public AuthController(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder, TokenProvider tokenProvider) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");
            
            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
            }
            
            // Verify username and password
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if(!passwordEncoder.matches(password, userDetails.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
            }

            // Generate token
            String token = tokenProvider.generateToken(Map.of("username", username));
            return ResponseEntity.ok(Map.of("token", token, "username", username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        String username = authentication.getName();
        java.util.List<String> roles = authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(Map.of(
            "username", username,
            "roles", roles
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // For JWT, logout is handled client-side by removing the token
        // Server-side logout is not needed for stateless JWT
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}