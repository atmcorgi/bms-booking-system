package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movie_request", indexes = {
        @Index(name = "idx_movie_request_code", columnList = "movie_code", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "movie_code", nullable = false, unique = true)
    private String movieCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id")
    private Movie movie; 

    // formats/languages được lấy trực tiếp từ Movie, không lưu ở request

    @Column(name = "priority")
    private Integer priority;   // higher first

    @Column(name = "demand_score")
    private Double demandScore; // 0.0 - 1.0

    @Column(name = "status")
    private String status;      // PENDING, SCHEDULED, APPROVED, REJECTED

    // Target theater for this request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id")
    private Theater theater;

    // Who created this request (staff username)
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = "PENDING";
        if (priority == null) priority = 0;
        if (demandScore == null) demandScore = 0.0;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


