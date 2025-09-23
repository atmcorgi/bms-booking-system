package fsa.training.service.booking;

import fsa.training.entity.Booking;
import fsa.training.entity.Showtime;
import fsa.training.repository.booking.BookingRepository;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.repository.booking.ShowtimeRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    public BookingService(BookingRepository bookingRepository, ShowtimeRepository showtimeRepository, 
                         SeatRepository seatRepository) {
        this.bookingRepository = bookingRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
    }

    public List<Booking> findByShowtimeId(Long showtimeId) {
        return bookingRepository.findByShowtimeId(showtimeId);
    }

    public Optional<Booking> getById(Long id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> bookMultiple(Long showtimeId, List<Long> seatIds, String customerName, String customerPhone) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(showtimeId);
        if (!showtimeOpt.isPresent()) {
            return Collections.emptyList();
        }
        
        Showtime showtime = showtimeOpt.get();
        Instant bookingTime = Instant.now();
        
        return seatIds.stream()
            .map(seatId -> seatRepository.findById(seatId))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(seat -> {
                Booking booking = Booking.builder()
                        .showtime(showtime)
                        .seat(seat)
                        .customerName(customerName)
                        .customerPhone(customerPhone)
                        .bookingTime(bookingTime)
                        .status("CONFIRMED")
                        .build();
                return bookingRepository.save(booking);
            })
            .collect(Collectors.toList());
    }

    public List<Booking> getByIds(List<Long> ids) {
        return bookingRepository.getByIds(ids);
    }
} 