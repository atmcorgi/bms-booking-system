package fsa.training.repository;

import fsa.training.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find notifications for a specific user
     */
    Page<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String username, Pageable pageable);
    
    /**
     * Find unread notifications for a specific user
     */
    List<Notification> findByRecipientUsernameAndIsReadFalseOrderByCreatedAtDesc(String username);
    
    /**
     * Count unread notifications for a specific user
     */
    long countByRecipientUsernameAndIsReadFalse(String username);
    
    /**
     * Find notifications by type for a specific user
     */
    @Query("SELECT n FROM Notification n WHERE n.recipientUsername = :username AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientAndType(@Param("username") String username, @Param("type") Notification.NotificationType type);
    
    /**
     * Mark notification as read
     */
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markAsRead(@Param("id") Long id);
    
    /**
     * Mark all notifications as read for a user
     */
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientUsername = :username")
    void markAllAsRead(@Param("username") String username);
}
