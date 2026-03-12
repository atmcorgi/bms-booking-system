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

    public Map<String, Object> getRevenueStats(LocalDate from, LocalDate to, Long theaterId) {
        // Fetch all PAID bookings in range
        List<Booking> bookings;
        if (theaterId != null) {
            bookings = bookingRepository.findByStatusAndBookingTimeBetweenAndTheaterId(
                "PAID",
                from.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant(),
                theaterId
            );
        } else {
            bookings = bookingRepository.findByStatusAndBookingTimeBetween(
                "PAID",
                from.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()
            );
        }

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

    public List<Map<String, Object>> getTopMovies(int limit, Long theaterId) {
        List<Object[]> results;
        if (theaterId != null) {
            results = bookingRepository.findTopMoviesByBookingCountAndTheater(theaterId, PageRequest.of(0, limit));
        } else {
            results = bookingRepository.findTopMoviesByBookingCount(PageRequest.of(0, limit));
        }
        
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
    
    public Map<String, Object> getSummary(Long theaterId) {
        // Simple summary for cards
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        
        Map<String, Object> monthStats = getRevenueStats(startOfMonth, today, theaterId);
        
        // Calculate best month of the year
        LocalDate startOfYear = today.withDayOfYear(1);
        Map<String, Object> yearStats = getRevenueStats(startOfYear, today, theaterId);
        @SuppressWarnings("unchecked")
        Map<String, Double> dailyRevenue = (Map<String, Double>) yearStats.get("dailyRevenue");
        
        // Group by month
        Map<String, Double> monthlyRevenue = new HashMap<>();
        dailyRevenue.forEach((dateStr, amount) -> {
            String month = dateStr.substring(0, 7); // yyyy-MM
            monthlyRevenue.merge(month, amount, Double::sum);
        });
        
        // Find best month
        String bestMonth = "N/A";
        double bestMonthRevenue = 0;
        for (Map.Entry<String, Double> entry : monthlyRevenue.entrySet()) {
            if (entry.getValue() > bestMonthRevenue) {
                bestMonthRevenue = entry.getValue();
                bestMonth = entry.getKey(); // yyyy-MM format
            }
        }
        
        // Find best selling movie
        List<Map<String, Object>> topMovies = getTopMovies(1, theaterId);
        String bestMovieTitle = "N/A";
        long bestMovieBookings = 0;
        
        if (!topMovies.isEmpty()) {
            bestMovieTitle = (String) topMovies.get(0).get("title");
            bestMovieBookings = (Long) topMovies.get(0).get("bookings");
        }
        
        // Format bestMonth for display (e.g., "10/2023")
        if (!bestMonth.equals("N/A")) {
            String[] parts = bestMonth.split("-");
            bestMonth = parts[1] + "/" + parts[0];
        }

        Map<String, Object> result = new HashMap<>();
        result.put("monthRevenue", monthStats.get("totalRevenue"));
        result.put("monthBookings", monthStats.get("totalBookings"));
        result.put("bestMonth", bestMonth);
        result.put("bestMonthRevenue", bestMonthRevenue);
        result.put("bestMovie", bestMovieTitle);
        result.put("bestMovieBookings", bestMovieBookings);
        
        return result;
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
