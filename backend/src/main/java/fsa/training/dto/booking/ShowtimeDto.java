package fsa.training.dto.booking;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeDto {
    private Long id;
    private LocalDate showDate;
    private LocalTime showTime;
} 