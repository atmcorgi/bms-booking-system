package fsa.training.controller.staff;

import fsa.training.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/staff/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Hiển thị danh sách notifications
     */
    @GetMapping
    public String listNotifications(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            Model model) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Get notifications with pagination
        var notifications = notificationService.getNotificationsForUser(username, page, size);
        
        // Get unread count
        long unreadCount = notificationService.getUnreadCount(username);
        
        model.addAttribute("notifications", notifications.getContent());
        model.addAttribute("page", notifications);
        model.addAttribute("unreadCount", unreadCount);
        model.addAttribute("pageTitle", "Thông báo");
        
        return "staff/notifications/list";
    }
    
    @PostMapping("/{id}/read")
    @ResponseBody
    public String markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return "success";
        } catch (Exception e) {
            return "error";
        }
    }
    
    @PostMapping("/mark-all-read")
    @ResponseBody
    public String markAllAsRead() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            notificationService.markAllAsRead(username);
            return "success";
        } catch (Exception e) {
            return "error";
        }
    }
    
    @GetMapping("/unread-count")
    @ResponseBody
    public long getUnreadCount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationService.getUnreadCount(username);
    }
}
