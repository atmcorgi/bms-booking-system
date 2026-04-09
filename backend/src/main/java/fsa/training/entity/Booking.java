package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "booking")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "showtime_id")
    private Showtime showtime;

    @ManyToOne
    @JoinColumn(name = "seat_id")
    private Seat seat;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    private String customerName;
    private String customerPhone;
    private String email;
    
    @Column(name = "booking_time")
    private Instant bookingTime;
    private String status;
    private String paymentCode;
    
    // Self-scan fields
    @Column(name = "used")
    private Boolean used = false;
    
    @Column(name = "used_at")
    private Instant usedAt;
    
    // QR Token for self-scan (generated once when paid)
    @Column(name = "qr_token", length = 500)
    private String qrToken;
}