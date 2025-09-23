package fsa.training.controller.staff;

import fsa.training.entity.Notification;
import fsa.training.repository.NotificationRepository;
import fsa.training.dto.admin.NotificationMarkReadRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/notifications")
public class StaffNotificationApiController {
    private final NotificationRepository notificationRepository;

    public StaffNotificationApiController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication auth) {
        String username = auth.getName();
        List<Notification> items = notificationRepository.findByRecipientUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
        long unread = notificationRepository.countByRecipientUsernameAndIsReadFalse(username);
        List<Map<String, Object>> outItems = items.stream().map(n -> {
            Map<String, Object> m = new HashMap<>();
            m.put("title", n.getTitle());
            m.put("id", n.getId());
            m.put("message", n.getMessage());
            m.put("type", n.getType());
            m.put("isRead", Boolean.TRUE.equals(n.getIsRead()));
            m.put("createdAt", n.getCreatedAt());
            m.put("relatedMovieId", n.getRelatedMovieId());
            m.put("relatedTheaterId", n.getRelatedTheaterId());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> out = new HashMap<>();
        out.put("unread", unread);
        out.put("items", outItems);
        return ResponseEntity.ok(out);
    }

    @PostMapping("/mark-read")
    public ResponseEntity<?> markRead(Authentication auth, @RequestBody NotificationMarkReadRequest request) {
        String username = auth.getName();
        List<Long> ids = request.getIds();
        if (ids.isEmpty()) return ResponseEntity.ok(Map.of("updated", 0));
        List<Long> idList = ids;
        List<Notification> items = notificationRepository.findAllById(idList).stream()
                .filter(n -> username.equals(n.getRecipientUsername()))
                .collect(Collectors.toList());
        int updated = 0;
        for (Notification n : items) {
            if (!Boolean.TRUE.equals(n.getIsRead())) {
                n.setIsRead(true);
                updated++;
            }
        }
        if (updated > 0) notificationRepository.saveAll(items);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead(Authentication auth) {
        String username = auth.getName();
        List<Notification> items = notificationRepository.findByRecipientUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
        int updated = 0;
        for (Notification n : items) {
            if (!Boolean.TRUE.equals(n.getIsRead())) {
                n.setIsRead(true);
                updated++;
            }
        }
        if (updated > 0) notificationRepository.saveAll(items);
        return ResponseEntity.ok(Map.of("updated", updated));
    }
}


