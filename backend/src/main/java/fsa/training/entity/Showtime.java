package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "showtime", uniqueConstraints = {
    @UniqueConstraint(name = "uk_showtime_room_date_time", columnNames = {"room_id", "show_date", "show_time"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Showtime {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_request_id")
    private MovieRequest movieRequest;

    @ManyToOne
    @JoinColumn(name = "theater_id")
    private Theater theater;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "show_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate showDate;

    @Column(name = "show_time")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    private LocalTime showTime;

    @Column(name = "price_standard")
    private Integer priceStandard; // VND per seat

    @Column(name = "price_vip")
    private Integer priceVip; // VND per seat
}