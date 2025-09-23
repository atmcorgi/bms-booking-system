package fsa.training.controller.booking;

import fsa.training.entity.*;
import fsa.training.service.movie.MovieService;
import fsa.training.service.booking.ShowtimeService;
import fsa.training.service.booking.SeatService;
import fsa.training.service.booking.BookingService;
import fsa.training.service.theater.LocationService;
import fsa.training.service.booking.SeatHoldService;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.HashMap;
import fsa.training.dto.theater.ProvinceDto;
import fsa.training.dto.theater.DistrictDto;
import fsa.training.dto.booking.ShowtimeDto;

@Controller
@RequestMapping("/booking")
public class BookingController {
    private final MovieService movieService;
    private final ShowtimeService showtimeService;
    private final SeatService seatService;
    private final BookingService bookingService;
    private final LocationService locationService;
    private final SeatHoldService seatHoldService;

    public BookingController(MovieService movieService, ShowtimeService showtimeService, 
                           SeatService seatService, BookingService bookingService, 
                           LocationService locationService, SeatHoldService seatHoldService) {
        this.movieService = movieService;
        this.showtimeService = showtimeService;
        this.seatService = seatService;
        this.bookingService = bookingService;
        this.locationService = locationService;
        this.seatHoldService = seatHoldService;
    }
    
    @GetMapping("/theater")
    public String theaterBooking() {
        return "booking/select-theater";
    }

    // Hold a seat for current session (TTL-based)
    @PostMapping("/api/shows/{showtimeId}/holds")
    @ResponseBody
    public Map<String, Object> holdSeat(@PathVariable Long showtimeId,
                                        @RequestParam Long seatId,
                                        jakarta.servlet.http.HttpSession session) {
        String ownerKey = session.getId();
        boolean ok = seatHoldService.hold(showtimeId, seatId, ownerKey);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", ok);
        if (!ok) {
            resp.put("message", "Seat is currently held by someone else");
        }
        return resp;
    }

    // Release a seat hold for current session
    @DeleteMapping("/api/shows/{showtimeId}/holds")
    @ResponseBody
    public Map<String, Object> releaseSeat(@PathVariable Long showtimeId,
                                           @RequestParam Long seatId,
                                           jakarta.servlet.http.HttpSession session) {
        String ownerKey = session.getId();
        boolean ok = seatHoldService.release(showtimeId, seatId, ownerKey);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", ok);
        return resp;
    }
    
    // Helper method để parse date và tránh code duplication
    private LocalDate parseShowDate(String showDate) {
        return (showDate != null && !showDate.isBlank()) ? LocalDate.parse(showDate) : null;
    }
    
    // Helper method để lấy start date (today)
    private LocalDate getStartDate() {
        return LocalDate.now();
    }
    
    // Helper method để tính weekend multiplier
    private double calculateWeekendMultiplier(LocalDate showDate) {
        if (showDate == null) return 1.0;
        DayOfWeek dayOfWeek = showDate.getDayOfWeek();
        return (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) ? 1.15 : 1.0;
    }
    
    // API: Lấy danh sách location (tỉnh/thành phố)
    @GetMapping("/api/locations")
    @ResponseBody
    @Transactional(readOnly = true)
    public List<ProvinceDto> getLocations(@RequestParam(required = false) Long movieId,
                                          @RequestParam(required = false) String showDate) {
        LocalDate date = parseShowDate(showDate);
        LocalDate start = date != null ? date : getStartDate();
        
        List<Province> provinces = locationService.getProvincesWithShowtimesFromDate(start, movieId);
        
        return provinces.stream()
                .map(p -> ProvinceDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .code(p.getCode())
                        .latitude(p.getLatitude())
                        .longitude(p.getLongitude())
                        .build())
                .collect(Collectors.toList());
    }

    // API: Lấy danh sách district theo location 
    @GetMapping("/api/districts")
    @ResponseBody
    @Transactional(readOnly = true)
    public List<DistrictDto> getDistricts(@RequestParam Long provinceId,
                                          @RequestParam(required = false) Long movieId,
                                          @RequestParam(required = false) String showDate) {
        LocalDate date = parseShowDate(showDate);
        LocalDate start = date != null ? date : getStartDate();
        
        List<District> districts = locationService.getDistrictsWithShowtimesFromDate(provinceId, start, movieId);
        
        return districts.stream()
                .map(d -> DistrictDto.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .latitude(d.getLatitude())
                        .longitude(d.getLongitude())
                        .provinceId(d.getProvince().getId())
                        .build())
                .collect(Collectors.toList());
    }

    // API: Lấy danh sách rạp theo location + district
    @GetMapping("/api/theaters")
    @ResponseBody
    @Transactional(readOnly = true)
    public List<Theater> getTheaters(@RequestParam Long provinceId,
                                     @RequestParam Long districtId,
                                     @RequestParam(required = false) Long movieId,
                                     @RequestParam(required = false) String showDate) {
        LocalDate date = parseShowDate(showDate);
        LocalDate start = date != null ? date : getStartDate();
        
        return locationService.getTheatersWithShowtimesFromDate(districtId, start, movieId);
    }

    // API: Lấy danh sách ghế theo ROOM của showtime và trạng thái đã đặt (theo showtime)
    @GetMapping("/api/seats")
    @ResponseBody
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSeats(@RequestParam Long theaterId, @RequestParam Long showtimeId) {
        Optional<Showtime> showtimeOpt = showtimeService.getById(showtimeId);
        if (showtimeOpt.isEmpty() || showtimeOpt.get().getRoom() == null) {
            return java.util.Collections.emptyList();
        }

        Showtime st = showtimeOpt.get();
        List<Seat> seats = seatService.findByRoomId(st.getRoom().getId());
        Set<Long> bookedSeatIds = bookingService.findByShowtimeId(showtimeId)
                .stream()
                .map(b -> b.getSeat().getId())
                .collect(Collectors.toSet());

        return seats.stream()
                .map(seat -> buildSeatMap(seat, st, bookedSeatIds))
                .collect(Collectors.toList());
    }

    private Map<String, Object> buildSeatMap(Seat seat, Showtime showtime, Set<Long> bookedSeatIds) {
        int base = (seat.getSeatType() == SeatType.VIP) ? 
            (showtime.getPriceVip() != null ? showtime.getPriceVip() : 0) : 
            (showtime.getPriceStandard() != null ? showtime.getPriceStandard() : 0);
        double multiplier = calculateWeekendMultiplier(showtime.getShowDate());
        int unitPrice = (int) Math.round(base * multiplier);
        
        return Map.of(
            "id", seat.getId(),
            "seatNumber", seat.getSeatNumber(),
            "seatType", seat.getSeatType().name(),
            "booked", bookedSeatIds.contains(seat.getId()),
            "unitPrice", unitPrice
        );
    }

    // API: Lấy danh sách phim theo theaterId
    @GetMapping("/api/movies")
    @ResponseBody
    @Transactional(readOnly = true)
    public List<Movie> getMovies(@RequestParam Long theaterId) {
        return movieService.getMoviesByTheaterIdFromToday(theaterId);
    }

    // API: Lấy danh sách ngày có suất chiếu
    @GetMapping("/api/showdates")
    @ResponseBody
    @Transactional(readOnly = true)
    public List<String> getShowDates(@RequestParam Long theaterId,
                                   @RequestParam(required = false) Long movieId) {
        // Tối ưu với Specification thay vì multiple queries
        List<Showtime> all = showtimeService.findAvailableShowtimes(movieId, theaterId, null);
        
        LocalDate start = getStartDate();
        
        return all.stream()
                .filter(s -> s.getShowDate() != null && !s.getShowDate().isBefore(start))
                .map(s -> s.getShowDate().toString())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // API: Lấy danh sách showtime theo theaterId và ngày cụ thể
    @GetMapping("/api/showtimes")
    @ResponseBody
    @Transactional(readOnly = true)
    public List<ShowtimeDto> getShowtimes(@RequestParam Long theaterId,
                                       @RequestParam(required = false) Long movieId,
                                       @RequestParam(required = false) String showDate) {
        LocalDate date = parseShowDate(showDate);
        LocalDate start = getStartDate();
        
        List<Showtime> all;
        if (date != null) {
            all = (movieId != null)
                    ? showtimeService.findByMovieIdAndTheaterId(movieId, theaterId)
                    : showtimeService.findByTheaterId(theaterId);
            
            all = all.stream()
                    .filter(s -> s.getShowDate() != null && s.getShowDate().equals(date))
                    .collect(Collectors.toList());
        } else {
            all = (movieId != null)
                    ? showtimeService.findByMovieIdAndTheaterId(movieId, theaterId)
                    : showtimeService.findByTheaterId(theaterId);
            
            all = all.stream()
                    .filter(s -> s.getShowDate() != null && !s.getShowDate().isBefore(start))
                    .collect(Collectors.toList());
        }
        
        return all.stream()
                .map(s -> ShowtimeDto.builder()
                        .id(s.getId())
                        .showDate(s.getShowDate())
                        .showTime(s.getShowTime())
                        .build())
                .collect(Collectors.toList());
    }

    // Xuất vé
    @GetMapping("/tickets")
    @Transactional(readOnly = true)
    public String showTickets(@RequestParam String bookingIds, Model model) {
        List<Long> ids = Arrays.stream(bookingIds.split(","))
                               .map(Long::parseLong)
                               .collect(Collectors.toList());
        List<Booking> bookings = bookingService.getByIds(ids);
        model.addAttribute("bookings", bookings);

        // Compute unit price per booking based on seat type + weekend multiplier
        Map<Long, Integer> pricesById = bookings.stream()
            .filter(b -> b != null && b.getShowtime() != null && b.getSeat() != null)
            .collect(Collectors.toMap(
                Booking::getId,
                b -> {
                    Showtime st = b.getShowtime();
                    int base = (b.getSeat().getSeatType() == SeatType.VIP) 
                        ? (st.getPriceVip() != null ? st.getPriceVip() : 0)
                        : (st.getPriceStandard() != null ? st.getPriceStandard() : 0);
                    double multiplier = calculateWeekendMultiplier(st.getShowDate());
                    return (int)Math.round(base * multiplier);
                }
            ));
        model.addAttribute("pricesById", pricesById);
        return "booking/tickets";
    }
} 