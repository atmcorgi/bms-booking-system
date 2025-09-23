package fsa.training.controller.admin;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping({"", "/", "/dashboard"})
    public String adminRoot(Authentication authentication) {
        // Debug: Log authorities
        
        // Redirect based on user role
        if (authentication.getAuthorities().stream().anyMatch(auth -> "ADMIN".equals(auth.getAuthority()))) {
            return "redirect:/admin/theater";
        } else if (authentication.getAuthorities().stream().anyMatch(auth -> "STAFF".equals(auth.getAuthority()))) {
            return "redirect:/staff";
        }
        return "redirect:/auth/viewLogin";
    }
}
