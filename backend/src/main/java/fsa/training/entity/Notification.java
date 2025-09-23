package fsa.training.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "recipient_username", nullable = false)
    private String recipientUsername;
    
    @Column(name = "related_movie_id")
    private Long relatedMovieId;
    
    @Column(name = "related_theater_id")
    private Long relatedTheaterId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    public enum NotificationType {
        MOVIE_ASSIGNED,
        MOVIE_SCHEDULED,
        MOVIE_PUBLISHED,
        SYSTEM_ANNOUNCEMENT
    }
}
