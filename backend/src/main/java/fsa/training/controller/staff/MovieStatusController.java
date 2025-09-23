package fsa.training.controller.staff;

import fsa.training.dto.movie.MovieStatusProjection;
import fsa.training.service.staff.StaffWorkflowService;
import fsa.training.service.movie.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;

/**
 * Staff Movie Status Controller - Chỉ dành cho STAFF
 */
@Controller
@RequestMapping("/staff/workflow")
public class MovieStatusController {

    @Autowired
    private StaffWorkflowService staffWorkflowService;

    @Autowired
    private MovieService movieService;

    @GetMapping({"", "/", "/dashboard"})
    public String workflowDashboard(Model model) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        
        StaffWorkflowService.StaffDashboardStats stats = staffWorkflowService.getDashboardStats(username);
        
        if (stats.getTotalItems() == 0) {
            model.addAttribute("error", "Chưa có phim nào được assign cho rạp của bạn. Liên hệ ADMIN để assign phim.");
        }
        
        model.addAttribute("assignedCount", stats.getAssignedCount());
        model.addAttribute("scheduledCount", stats.getScheduledCount());
        model.addAttribute("publishedCount", stats.getPublishedCount());
        model.addAttribute("totalItems", stats.getTotalItems());
        model.addAttribute("pageTitle", "Staff Dashboard");
        return "staff/workflow/dashboard";
    }

    @GetMapping("/assigned")
    public String viewAssignedMovies(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            Model model) {
        
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Page<MovieStatusProjection> assignedMovies = staffWorkflowService.getAllAssignedMovies(username, page, size);
        
        if (assignedMovies.isEmpty()) {
            model.addAttribute("error", "Chưa có phim nào được assign cho rạp của bạn. Liên hệ ADMIN để assign phim.");
        }
        
        model.addAttribute("movies", assignedMovies.getContent());
        model.addAttribute("page", assignedMovies);
        model.addAttribute("pageTitle", "Phim đã assign");
        return "staff/workflow/assigned";
    }

    @GetMapping("/scheduled")
    public String viewScheduledMovies(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            Model model) {
        
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Page<MovieStatusProjection> scheduledMovies = staffWorkflowService.getMoviesByStatus(username, "SCHEDULED", page, size);

        model.addAttribute("movies", scheduledMovies.getContent());
        model.addAttribute("page", scheduledMovies);
        model.addAttribute("pageTitle", "Scheduled Movies");
        return "staff/workflow/scheduled-movies";
    }

    @GetMapping("/published")
    public String viewPublishedMovies(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            Model model) {
        
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Page<MovieStatusProjection> publishedMovies = staffWorkflowService.getMoviesByStatus(username, "PUBLISHED", page, size);

        model.addAttribute("movies", publishedMovies.getContent());
        model.addAttribute("page", publishedMovies);
        model.addAttribute("pageTitle", "Published Movies");
        return "staff/workflow/published-movies";
    }

    @PostMapping("/publish")
    public String publishMovies(@RequestParam("movieCodes") java.util.List<String> movieCodes,
                               Model model) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Long theaterId = staffWorkflowService.getAssignedTheaterId(username);
        
        if (theaterId == null) {
            model.addAttribute("error", "Tài khoản STAFF chưa được gán rạp. Liên hệ ADMIN.");
            return "redirect:/staff/workflow/scheduled";
        }
        
        try {
            int publishedCount = 0;
            for (String movieCode : movieCodes) {
                // Chỉ publish phim đã được assign cho theater này và đang ở trạng thái SCHEDULED
                if (movieService.publishMovieForTheater(movieCode, theaterId)) {
                    publishedCount++;
                }
            }
            
            if (publishedCount > 0) {
                model.addAttribute("message", "Đã publish " + publishedCount + " phim thành công!");
                model.addAttribute("messageType", "success");
            } else {
                model.addAttribute("message", "Không có phim nào được publish. Kiểm tra lại quyền hạn và trạng thái phim.");
                model.addAttribute("messageType", "warning");
            }
        } catch (Exception e) {
            model.addAttribute("message", "Lỗi khi publish phim: " + e.getMessage());
            model.addAttribute("messageType", "error");
        }
        
        return "redirect:/staff/workflow/scheduled";
    }

}