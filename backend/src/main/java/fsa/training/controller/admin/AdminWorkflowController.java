package fsa.training.controller.admin;

import fsa.training.service.admin.MovieWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Admin Workflow Controller - Xử lý workflow dashboard cho ADMIN
 */
@Controller
@RequestMapping("/admin/workflow")
public class AdminWorkflowController {

    @Autowired
    private MovieWorkflowService movieWorkflowService;

    @GetMapping({"", "/", "/dashboard"})
    public String workflowDashboard(Model model) {
        // Lấy thống kê workflow cho admin
        var stats = movieWorkflowService.getDashboardStatistics();
        
        model.addAttribute("pendingCount", stats.getPendingCount());
        model.addAttribute("approvedCount", stats.getApprovedCount());
        model.addAttribute("scheduledCount", stats.getScheduledCount());
        model.addAttribute("publishedCount", stats.getPublishedCount());
        
        // Tính toán progress
        int totalMovies = stats.getPendingCount() + stats.getApprovedCount() + 
                         stats.getScheduledCount() + stats.getPublishedCount();
        
        if (totalMovies > 0) {
            model.addAttribute("approvalProgress", 
                (stats.getApprovedCount() * 100) / totalMovies);
            model.addAttribute("assignmentProgress", 
                (stats.getScheduledCount() * 100) / totalMovies);
            model.addAttribute("schedulingProgress", 
                (stats.getScheduledCount() * 100) / totalMovies);
            model.addAttribute("publishingProgress", 
                (stats.getPublishedCount() * 100) / totalMovies);
        } else {
            model.addAttribute("approvalProgress", 0);
            model.addAttribute("assignmentProgress", 0);
            model.addAttribute("schedulingProgress", 0);
            model.addAttribute("publishingProgress", 0);
        }
        
        model.addAttribute("pageTitle", "Admin Workflow Dashboard");
        return "admin/workflow/dashboard";
    }
}
