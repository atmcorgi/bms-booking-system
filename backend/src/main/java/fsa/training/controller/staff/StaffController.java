package fsa.training.controller.staff;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Staff Controller - Chỉ dành cho STAFF
 */
@Controller
@RequestMapping("/staff")
public class StaffController {

    @GetMapping({"", "/", "/dashboard"})
    public String staffDashboard(Authentication authentication, Model model) {
        // Debug: Log authorities
        
        return "redirect:/staff/workflow";
    }
}
