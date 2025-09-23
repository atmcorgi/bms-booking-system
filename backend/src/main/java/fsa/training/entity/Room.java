package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Column(name = "supported_formats")
    private String supportedFormats; // e.g., "2D|3D|IMAX"

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Showtime> showtimes = new ArrayList<>();

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Seat> seats = new ArrayList<>();
}