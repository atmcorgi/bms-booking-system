package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "banner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    private MediaType mediaType; // "IMAGE" or "VIDEO"
    
    @Column(name = "media_url", nullable = false, length = 500)
    private String mediaUrl; // URL to image or video

    @Column(name = "image_url", length = 500)
    private String imageUrl; // URL to image or video
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl; // Thumbnail for video (optional)
    
    @Column(name = "link_url", length = 500)
    private String linkUrl; // URL to redirect when banner is clicked (optional)
    
    @Column(name = "display_order")
    private Integer displayOrder; // Order of display in carousel
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (displayOrder == null) {
            displayOrder = 0;
        }
        if (isActive == null) {
            isActive = true;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

