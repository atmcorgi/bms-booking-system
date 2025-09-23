package fsa.training.service;

import fsa.training.entity.Notification;
import fsa.training.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    // Thread pool cho việc tạo notification bất đồng bộ
    private final Executor notificationExecutor = Executors.newFixedThreadPool(10);
    
    // Random generator cho delay giả lập
    private final Random random = new Random();
    
    /**
     * Create a new notification
     */
    public Notification createNotification(String title, String message, 
                                         Notification.NotificationType type,
                                         String recipientUsername,
                                         Long relatedMovieId, Long relatedTheaterId) {
        // Giả lập delay random 1-3 giây để test performance
        try {
            int delayMs = 1000 + random.nextInt(2000); // 1-3 giây
            Thread.sleep(delayMs);
            logger.debug("📧 Gửi notification cho {} (delay: {}ms)", recipientUsername, delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Thread bị interrupt: {}", e.getMessage());
        }
        
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .recipientUsername(recipientUsername)
                .relatedMovieId(relatedMovieId)
                .relatedTheaterId(relatedTheaterId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        return notificationRepository.save(notification);
    }
    
    /**
     * Create notifications for multiple recipients concurrently
     */
    public CompletableFuture<List<Notification>> createNotificationsForMultipleUsers(
            String title, String message, 
            Notification.NotificationType type,
            List<String> recipientUsernames,
            Long relatedMovieId, Long relatedTheaterId) {
        
        long startTime = System.currentTimeMillis();
        logger.info("🚀 BẮT ĐẦU gửi notification BẤT ĐỒNG BỘ cho {} người...", recipientUsernames.size());
        
        List<CompletableFuture<Notification>> notificationFutures = recipientUsernames.stream()
                .map(username -> CompletableFuture.supplyAsync(
                        () -> createNotification(title, message, type, username, relatedMovieId, relatedTheaterId),
                        notificationExecutor
                ))
                .collect(Collectors.toList());
        
        return CompletableFuture.allOf(notificationFutures.toArray(new CompletableFuture[0]))
                .thenApply(v -> {
                    long endTime = System.currentTimeMillis();
                    long totalTime = endTime - startTime;
                    logger.info("✅ HOÀN THÀNH gửi notification BẤT ĐỒNG BỘ cho {} người", recipientUsernames.size());
                    logger.info("⏱️  Tổng thời gian: {}ms ({:.2f}s)", totalTime, totalTime / 1000.0);
                    return notificationFutures.stream()
                            .map(CompletableFuture::join)
                            .collect(Collectors.toList());
                });
    }
    
    /**
     * Get notifications for a user with pagination
     */
    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsForUser(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username, pageable);
    }
    
    /**
     * Get unread notifications for a user
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(String username) {
        return notificationRepository.findByRecipientUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
    }
    
    /**
     * Count unread notifications for a user
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        return notificationRepository.countByRecipientUsernameAndIsReadFalse(username);
    }
    
    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(String username) {
        notificationRepository.markAllAsRead(username);
    }
    
    /**
     * Create movie assignment notification
     */
    public Notification createMovieAssignmentNotification(String movieTitle, String theaterName, 
                                                        String assignedBy, String staffUsername,
                                                        Long movieId, Long theaterId) {
        String title = "Phim mới được assign";
        String message = String.format("Phim '%s' đã được assign cho rạp %s bởi %s. " +
                "Bạn có thể bắt đầu lập lịch chiếu cho phim này.", 
                movieTitle, theaterName, assignedBy);
        
        return createNotification(title, message, Notification.NotificationType.MOVIE_ASSIGNED,
                staffUsername, movieId, theaterId);
    }
    
    /**
     * Create movie assignment notifications for multiple staff concurrently
     */
    public CompletableFuture<List<Notification>> createMovieAssignmentNotificationsForMultipleStaff(
            String movieTitle, String theaterName, 
            String assignedBy, List<String> staffUsernames,
            Long movieId, Long theaterId) {
        
        String title = "Phim mới được assign";
        String message = String.format("Phim '%s' đã được assign cho rạp %s bởi %s. " +
                "Bạn có thể bắt đầu lập lịch chiếu cho phim này.", 
                movieTitle, theaterName, assignedBy);
        
        return createNotificationsForMultipleUsers(title, message, 
                Notification.NotificationType.MOVIE_ASSIGNED, staffUsernames, movieId, theaterId);
    }
    
    
}
