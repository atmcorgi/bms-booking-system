package fsa.training.service.report;

import fsa.training.entity.Booking;
import fsa.training.entity.Movie;
import fsa.training.repository.booking.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private BookingRepository bookingRepository;

    public Map<String, Object> getRevenueStats(LocalDate from, LocalDate to) {
        // Fetch all PAID bookings in range
        List<Booking> bookings = bookingRepository.findByStatusAndBookingTimeBetween(
                "PAID",
                from.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()
        );

        // Calculate total revenue
        double totalRevenue = bookings.stream().mapToDouble(this::calculateBookingPrice).sum();

        // Group by Date for Chart
        Map<String, Double> dailyRevenue = new TreeMap<>();
        bookings.forEach(b -> {
            String date = LocalDate.ofInstant(b.getBookingTime(), ZoneId.systemDefault()).toString();
            double price = calculateBookingPrice(b);
            dailyRevenue.merge(date, price, Double::sum);
        });

        // Fill missing dates with 0
        LocalDate current = from;
        while (!current.isAfter(to)) {
            dailyRevenue.putIfAbsent(current.toString(), 0.0);
            current = current.plusDays(1);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("totalBookings", bookings.size());
        result.put("dailyRevenue", dailyRevenue);
        return result;
    }

    public List<Map<String, Object>> getTopMovies(int limit) {
        List<Object[]> results = bookingRepository.findTopMoviesByBookingCount(PageRequest.of(0, limit));
        return results.stream().map(row -> {
            Movie movie = (Movie) row[0];
            Long count = (Long) row[1];
            Map<String, Object> map = new HashMap<>();
            map.put("movieCode", movie.getCode());
            map.put("title", movie.getTitle());
            map.put("posterUrl", movie.getPosterUrl());
            map.put("bookings", count);
            return map;
        }).collect(Collectors.toList());
    }
    
    public Map<String, Object> getSummary() {
        // Simple summary for cards
        // For efficiency, could use count() queries, but reusing existing logic for now
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        
        Map<String, Object> monthStats = getRevenueStats(startOfMonth, today);
        
        return Map.of(
            "monthRevenue", monthStats.get("totalRevenue"),
            "monthBookings", monthStats.get("totalBookings")
        );
    }

    private double calculateBookingPrice(Booking b) {
        // Duplicate logic from BookingController - ideally move to a shared utility or Booking entity method
        if (b.getShowtime() == null) return 0;
        
        double price = (b.getShowtime().getPriceStandard() != null ? b.getShowtime().getPriceStandard() : 0);
        if (b.getSeat() != null && b.getSeat().getSeatType() != null) {
            String type = b.getSeat().getSeatType().toString(); // Enum to String
            if ("VIP".equalsIgnoreCase(type)) {
                price = (b.getShowtime().getPriceVip() != null ? b.getShowtime().getPriceVip() : 0);
            }
            if ("COUPLE".equalsIgnoreCase(type)) {
                 // Assuming standard price * 2 for couple if not specified, or standard logic
                 // Based on controller logic: price *= 2
                 price *= 2; 
            }
        }
        return price;
    }
}
