package fsa.training.service.booking;

import fsa.training.entity.Booking;
import fsa.training.repository.booking.BookingRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingCleanupService {

    private final BookingRepository bookingRepository;

    public BookingCleanupService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void cancelExpiredPendingBookings() {
        Instant expirationThreshold = Instant.now().minus(15, ChronoUnit.MINUTES);
        
        // Find Pending bookings older than 15 minutes
        List<Booking> expiredBookings = bookingRepository.findByStatusAndBookingTimeBefore("PENDING", expirationThreshold);

        if (!expiredBookings.isEmpty()) {
            for (Booking booking : expiredBookings) {
                booking.setStatus("CANCELLED");
                // Note: We don't need to explicitly release the seat here because:
                // 1. The in-memory SeatHoldService handles short-term holds (TTL).
                // 2. The getSeats() logic already ignores non-PAID bookings if they are old.
            }
            bookingRepository.saveAll(expiredBookings);
        }
    }
}
