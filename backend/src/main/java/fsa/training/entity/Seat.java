package fsa.training.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "seat")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Seat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "theater_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Theater theater;

    @ManyToOne
    @JoinColumn(name = "room_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Room room; 

    @Column(name = "seat_number")
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false, length = 20)
    private SeatType seatType = SeatType.STANDARD;
}