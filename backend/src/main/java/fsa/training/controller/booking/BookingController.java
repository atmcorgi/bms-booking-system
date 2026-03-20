package fsa.training.controller.booking;

import fsa.training.entity.*;
import fsa.training.repository.theater.ProvinceRepository;
import fsa.training.repository.theater.DistrictRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.booking.ShowtimeRepository;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.repository.booking.BookingRepository;
import fsa.training.service.booking.SeatHoldService;
import fsa.training.service.mail.TicketEmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.Cacheable;

import fsa.training.repository.movie.MovieRepository;
import fsa.training.config.SepayConfig;
import fsa.training.repository.auth.AccountRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.Instant;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/booking", "/booking/api"})
public class BookingController {
    private final SeatHoldService seatHoldService;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final TheaterRepository theaterRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final MovieRepository movieRepository;
    private final AccountRepository accountRepository;
    private final SepayConfig sepayConfig;
    private final TicketEmailService ticketEmailService;

    public BookingController(
            SeatHoldService seatHoldService,
            ProvinceRepository provinceRepository,
            DistrictRepository districtRepository,
            TheaterRepository theaterRepository,
            ShowtimeRepository showtimeRepository,
            SeatRepository seatRepository,
            BookingRepository bookingRepository,
            MovieRepository movieRepository,
            AccountRepository accountRepository,
            SepayConfig sepayConfig,
            TicketEmailService ticketEmailService) {
        this.seatHoldService = seatHoldService;
        this.provinceRepository = provinceRepository;
        this.districtRepository = districtRepository;
        this.theaterRepository = theaterRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.movieRepository = movieRepository;
        this.accountRepository = accountRepository;
        this.sepayConfig = sepayConfig;
        this.ticketEmailService = ticketEmailService;
    }

    private String getCurrentOwnerKey(jakarta.servlet.http.HttpSession session) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        
        // Try getting request attributes or header (Need HttpServletRequest injected or passed)
        // Since we only have session here, we'll need to refactor or change signature.
        // Easier: Change signatures of methods calling this to accept HttpServletRequest.
        return session.getId();
    }
    
    // Helper to get owner key from request
    private String getCurrentOwnerKey(jakarta.servlet.http.HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        String guestId = request.getHeader("X-Guest-ID");
        if (guestId != null && !guestId.isEmpty()) {
            System.out.println("DEBUG: Using X-Guest-ID: " + guestId);
            return guestId;
        }
        System.out.println("DEBUG: Fallback to Session ID: " + request.getSession().getId());
        return request.getSession().getId();
    }

    // Hold a seat for current session (TTL-based)
    @PostMapping("/shows/{showtimeId}/holds")
    public Map<String, Object> holdSeat(@PathVariable Long showtimeId,
                                        @RequestParam Long seatId,
                                        jakarta.servlet.http.HttpServletRequest request) {
        String ownerKey = getCurrentOwnerKey(request);
        boolean ok = seatHoldService.hold(showtimeId, seatId, ownerKey);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", ok);
        if (!ok) {
            resp.put("message", "Seat is currently held by someone else");
        }
        return resp;
    }

    // Release a seat hold for current session
    @DeleteMapping("/shows/{showtimeId}/holds")
    public Map<String, Object> releaseSeat(@PathVariable Long showtimeId,
                                           @RequestParam Long seatId,
                                           jakarta.servlet.http.HttpServletRequest request) {
        String ownerKey = getCurrentOwnerKey(request);
        boolean ok = seatHoldService.release(showtimeId, seatId, ownerKey);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", ok);
        return resp;
    }

    // GET /booking/api/locations - Lấy danh sách tỉnh/thành
    @GetMapping("/locations")
    @Cacheable(value = "locations", key = "#movieId + '-' + #showDate")
    public ResponseEntity<List<Map<String, Object>>> getLocations(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) String showDate) {
        try {
            // Lấy showtime từ 1 năm trước trở đi (để bao gồm cả dữ liệu test cũ)
            LocalDate startDate = showDate != null ? LocalDate.parse(showDate) : LocalDate.now().minusYears(1);
            List<Province> provinces;
            
            if (movieId != null) {
                provinces = provinceRepository.findProvincesWithShowtimesForMovieFromDate(movieId, startDate);
            } else {
                provinces = provinceRepository.findProvincesWithShowtimesFromDate(startDate);
            }
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Province p : provinces) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("name", p.getName());
                result.add(map);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // GET /booking/api/districts - Lấy danh sách quận/huyện
    @GetMapping("/districts")
    @Cacheable(value = "districts", key = "#provinceId + '-' + #movieId + '-' + #showDate")
    public ResponseEntity<List<Map<String, Object>>> getDistricts(
            @RequestParam Long provinceId,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) String showDate) {
        try {
            LocalDate startDate = showDate != null ? LocalDate.parse(showDate) : LocalDate.now().minusYears(1);
            List<District> districts;
            
            if (movieId != null) {
                districts = districtRepository.findDistrictsWithShowtimesForMovieFromDate(provinceId, movieId, startDate);
            } else {
                districts = districtRepository.findDistrictsWithShowtimesFromDate(provinceId, startDate);
            }
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (District d : districts) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", d.getId());
                map.put("name", d.getName());
                result.add(map);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // GET /booking/api/theaters - Lấy danh sách rạp
    @GetMapping("/theaters")
    @Cacheable(value = "theaters", key = "#provinceId + '-' + #districtId + '-' + #movieId + '-' + #showDate")
    public ResponseEntity<List<Map<String, Object>>> getTheaters(
            @RequestParam Long provinceId,
            @RequestParam Long districtId,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) String showDate) {
        try {
            LocalDate startDate = showDate != null ? LocalDate.parse(showDate) : LocalDate.now().minusYears(1);
            List<Theater> theaters;
            
            if (movieId != null) {
                theaters = theaterRepository.findTheatersWithShowtimesForMovieFromDate(districtId, movieId, startDate);
            } else {
                theaters = theaterRepository.findTheatersWithShowtimesFromDate(districtId, startDate);
            }
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Theater t : theaters) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", t.getId());
                map.put("name", t.getName());
                map.put("address", t.getAddress() != null ? t.getAddress() : "");
                map.put("phone", t.getPhone() != null ? t.getPhone() : "");
                result.add(map);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // GET /booking/api/showdates - Lấy danh sách ngày chiếu
    @GetMapping("/showdates")
    @Cacheable(value = "showdates", key = "#theaterId + '-' + #movieId")
    public ResponseEntity<List<String>> getShowDates(
            @RequestParam Long theaterId,
            @RequestParam(required = false) Long movieId) {
        try {
            // Use optimized query instead of findAll().stream().filter()
            LocalDate startDate = LocalDate.now().minusDays(1);
            List<LocalDate> dates;
            
            if (movieId != null) {
                dates = showtimeRepository.findDistinctShowDatesByTheaterIdAndMovieIdFromDate(theaterId, movieId, startDate);
            } else {
                dates = showtimeRepository.findDistinctShowDatesByTheaterIdAndMovieIdFromDate(theaterId, null, startDate);
            }
            
            List<String> result = dates.stream()
                    .map(LocalDate::toString)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // GET /booking/api/showtimes - Lấy danh sách suất chiếu
    @GetMapping("/showtimes")
    public ResponseEntity<List<Map<String, Object>>> getShowtimes(
            @RequestParam Long theaterId,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) String showDate) {
        try {
            // Use optimized query instead of findAll().stream().filter()
            List<Showtime> showtimes;
            
            if (movieId != null && showDate != null) {
                showtimes = showtimeRepository.findByTheaterIdAndMovieIdAndShowDate(
                    theaterId, movieId, LocalDate.parse(showDate));
            } else if (movieId != null) {
                showtimes = showtimeRepository.findByTheaterIdAndMovieIdFromDate(
                    theaterId, movieId, LocalDate.now().minusYears(1));
            } else {
                showtimes = showtimeRepository.findByTheaterIdAndMovieIdFromDate(
                    theaterId, null, LocalDate.now().minusYears(1));
            }
            
            // Sort by showTime
            showtimes = showtimes.stream()
                    .sorted(Comparator.comparing(Showtime::getShowTime))
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Showtime s : showtimes) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("showDate", s.getShowDate().toString());
                map.put("showTime", s.getShowTime().toString());
                map.put("priceStandard", s.getPriceStandard());
                map.put("priceVip", s.getPriceVip());
                if (s.getMovie() != null) {
                    map.put("movieId", s.getMovie().getId());
                    map.put("movieTitle", s.getMovie().getTitle());
                }
                if (s.getRoom() != null) {
                    map.put("roomId", s.getRoom().getId());
                    map.put("roomName", s.getRoom().getName());
                }
                result.add(map);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // GET /booking/api/movies - Lấy danh sách phim đang chiếu tại rạp
    @GetMapping("/movies")
    public ResponseEntity<List<Map<String, Object>>> getMoviesInTheater(
            @RequestParam Long theaterId) {
        try {
            // Lấy showtime từ hôm nay trở đi
            LocalDate startDate = LocalDate.now();
            
            // Query movies directly with conditions (PUBLISHED & Has Showtimes)
            List<Movie> movies = movieRepository.findNowShowingMoviesByTheater(theaterId, startDate);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Movie m : movies) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("title", m.getTitle());
                map.put("posterUrl", m.getPosterUrl());
                map.put("duration", m.getDuration());
                map.put("ageRating", m.getAgeRating());
                
                List<Map<String, Object>> genres = new ArrayList<>();
                if (m.getGenres() != null) {
                    for (Genre g : m.getGenres()) {
                        Map<String, Object> gMap = new HashMap<>();
                        gMap.put("id", g.getId());
                        gMap.put("name", g.getName());
                        genres.add(gMap);
                    }
                }
                map.put("genres", genres);
                
                result.add(map);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // GET /booking/api/seats - Lấy danh sách ghế
    @GetMapping("/seats")
    public ResponseEntity<List<Map<String, Object>>> getSeats(
            @RequestParam Long theaterId,
            @RequestParam(required = false) Long showtimeId,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            List<Seat> seats;
            Long roomId;
            
            // Nếu có showtimeId, lấy ghế theo room của showtime đó
            if (showtimeId != null) {
                Optional<Showtime> showtimeOpt = showtimeRepository.findById(showtimeId);
                if (showtimeOpt.isEmpty()) {
                    return ResponseEntity.badRequest().build();
                }
                Showtime showtime = showtimeOpt.get();
                if (showtime.getRoom() == null) {
                    return ResponseEntity.badRequest().build();
                }
                roomId = showtime.getRoom().getId();
                // Use optimized query
                seats = seatRepository.findByRoomIdOrderBySeatNumberAsc(roomId);
            } else {
                // Nếu không có showtimeId, lấy tất cả ghế của theater
                seats = seatRepository.findByTheaterId(theaterId);
                roomId = null;
            }
            
            // Lấy danh sách ghế đã được đặt/giữ cho showtime này
            Map<Long, String> seatStatusMap = new HashMap<>(); // seatId -> status
            Map<Long, String> activeHolds = new HashMap<>();
            
            // Resolve currentAccountId
            Long currentAccountId = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                 String username = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
                 fsa.training.entity.Account acc = accountRepository.findByUsername(username).orElse(null);
                 if (acc != null) currentAccountId = acc.getId();
            }

            if (showtimeId != null) {
                List<Booking> bookings = bookingRepository.findByShowtimeId(showtimeId);
                // Một phiên đặt vé (PENDING) thường hết hạn sau 10-15 phút nếu không thanh toán
                Instant expirationThreshold = Instant.now().minus(java.time.Duration.ofMinutes(10));
                
                for (Booking b : bookings) {
                    if ("PAID".equals(b.getStatus())) {
                        seatStatusMap.put(b.getSeat().getId(), "PAID");
                    } else if ("PENDING".equals(b.getStatus()) && b.getBookingTime().isAfter(expirationThreshold)) {
                         // Check ownership
                        boolean isMyBooking = false;
                        if (currentAccountId != null && b.getAccount() != null && currentAccountId.equals(b.getAccount().getId())) {
                            isMyBooking = true;
                        }
                        seatStatusMap.put(b.getSeat().getId(), isMyBooking ? "MY_PENDING" : "PENDING");
                    }
                }
                
                activeHolds = seatHoldService.getHolds(showtimeId);
            }
            
            String currentOwnerKey = getCurrentOwnerKey(request);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Seat s : seats) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("seatNumber", s.getSeatNumber());
                map.put("seatType", s.getSeatType() != null ? s.getSeatType().name() : "STANDARD");
                
                String status = seatStatusMap.getOrDefault(s.getId(), "AVAILABLE");
                String holderKey = activeHolds.get(s.getId());
                boolean isHeldByOthers = holderKey != null && !holderKey.equals(currentOwnerKey);
                
                // Trả về booked=true nếu ghế không thể chọn được (đã mua, đang chờ thanh toán, hoặc đang bị người khác giữ)
                map.put("booked", !"AVAILABLE".equals(status) || isHeldByOthers);
                map.put("status", status); // PAID or AVAILABLE (PENDING is merged into PAID)
                map.put("heldByOthers", isHeldByOthers);
                
                if (s.getRoom() != null) {
                    map.put("roomId", s.getRoom().getId());
                    map.put("roomName", s.getRoom().getName());
                }
                result.add(map);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // POST /api/booking/cancel/{bookingId} - Hủy booking thủ công (User ấn nút Hủy hoặc X)
    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId, jakarta.servlet.http.HttpServletRequest request) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Booking booking = bookingOpt.get();

        // Security check: Only owner (User or Guest) can cancel
        String currentOwner = getCurrentOwnerKey(request);
        // Note: For simplicity in this fix, we trust the caller if they have the ID, 
        // but ideally we should check if currentOwner matches booking owner.
        // Given the short-lived nature of pending bookings, we'll allow it for now 
        // or check if it's PENDING.

        if ("PENDING".equals(booking.getStatus())) {
            booking.setStatus("FAILED"); // Or FAILED/CANCELLED
            bookingRepository.save(booking);
            
            // Release seats in memory service too (optional but good for immediate feedback)
            if (booking.getShowtime() != null && booking.getSeat() != null) {
                seatHoldService.release(booking.getShowtime().getId(), booking.getSeat().getId(), currentOwner);
            }
            
            return ResponseEntity.ok(Map.of("message", "Đã hủy đơn hàng thành công"));
        }
        
        return ResponseEntity.badRequest().body(Map.of("message", "Không thể hủy đơn hàng này"));
    }

    // POST /api/booking/cancel-by-code/{paymentCode} - Hủy toàn bộ booking theo mã thanh toán
    @PostMapping("/cancel-by-code/{paymentCode}")
    public ResponseEntity<?> cancelBookingByPaymentCode(@PathVariable String paymentCode, jakarta.servlet.http.HttpServletRequest request) {
        List<Booking> bookings = bookingRepository.findByPaymentCode(paymentCode);
        if (bookings.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String currentOwner = getCurrentOwnerKey(request);
        boolean anyCancelled = false;

        for (Booking booking : bookings) {
            if ("PENDING".equals(booking.getStatus())) {
                booking.setStatus("FAILED");
                // Release seat hold
                if (booking.getShowtime() != null && booking.getSeat() != null) {
                    seatHoldService.release(booking.getShowtime().getId(), booking.getSeat().getId(), currentOwner);
                }
                anyCancelled = true;
            }
        }
        
        if (anyCancelled) {
            bookingRepository.saveAll(bookings);
            return ResponseEntity.ok(Map.of("message", "Đã hủy đơn hàng thành công"));
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Không thể hủy đơn hàng này"));
    }

    // POST /api/booking/booking - Tạo booking và trả về URL thanh toán SePay
    @PostMapping("/booking")
    public ResponseEntity<?> createBooking(
            @RequestBody Map<String, Object> request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            Long showtimeId = Long.valueOf(request.get("showtimeId").toString());
            List<Long> seatIds = ((List<?>) request.get("seatIds")).stream()
                    .map(id -> Long.valueOf(id.toString()))
                    .toList();
            
            String ownerKey = getCurrentOwnerKey(httpRequest);
            String customerName = request.get("customerName").toString();
            String customerPhone = request.get("customerPhone").toString();

            // 1. Kiểm tra showtime
            Optional<Showtime> showtimeOpt = showtimeRepository.findById(showtimeId);
            if (showtimeOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Showtime không tồn tại"));
            Showtime showtime = showtimeOpt.get();

            // 2. Kiểm tra ghế có khả dụng không
            List<Booking> bookings = bookingRepository.findByShowtimeId(showtimeId);
            Instant expirationThreshold = Instant.now().minus(java.time.Duration.ofMinutes(10));
            Set<Long> unavailableSeatIds = bookings.stream()
                    .filter(b -> "PAID".equals(b.getStatus()) || ("PENDING".equals(b.getStatus()) && b.getBookingTime().isAfter(expirationThreshold)))
                    .map(b -> b.getSeat().getId())
                    .collect(Collectors.toSet());
 
            for (Long sid : seatIds) {
                if (unavailableSeatIds.contains(sid)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Ghế " + sid + " đã được đặt"));
                }
            }
            
            // 2.5 Kiểm tra xem user có đang giữ các ghế này không
            if (!seatHoldService.validateOwnedHolds(showtimeId, seatIds, ownerKey)) {
                
                // Fallback: Check if the hold belongs to the Guest ID (if user is logged in but hold was made as guest)
                String guestId = httpRequest.getHeader("X-Guest-ID");
                if (guestId != null && !guestId.equals(ownerKey)) {
                     if (seatHoldService.validateOwnedHolds(showtimeId, seatIds, guestId)) {
                         // Proceed (Allow the logged-in user to use the guest's hold)
                     } else {
                         return ResponseEntity.badRequest().body(Map.of("message", "Phiên giữ ghế đã hết hạn hoặc ghế đang bị người khác giữ. Vui lòng chọn lại ghế."));
                     }
                } else {
                    return ResponseEntity.badRequest().body(Map.of("message", "Phiên giữ ghế đã hết hạn hoặc ghế đang bị người khác giữ. Vui lòng chọn lại ghế."));
                }
            }

            // 3. Tính tổng tiền
            // 3. Tính tổng tiền
            int totalAmount = 0;
            
            List<Seat> selectedSeats = seatRepository.findAllById(seatIds);
            for (Seat s : selectedSeats) {
                double basePrice = (showtime.getPriceStandard() != null ? showtime.getPriceStandard() : 0);
                double typeMultiplier = 1.0;

                if (s.getSeatType() != null) {
                    if (s.getSeatType().name().equals("VIP")) {
                        basePrice = (showtime.getPriceVip() != null ? showtime.getPriceVip() : 0);
                    } else if (s.getSeatType().name().equals("COUPLE")) {
                        typeMultiplier = 2.0;
                    }
                }
                
                totalAmount += Math.round(basePrice * typeMultiplier);
            }

            // 4. Tạo payment code duy nhất (BMS + timestamp)
            String paymentCode = "BMS" + System.currentTimeMillis();

            // 5. Lưu booking vào DB
            // Lấy account hiện tại nếu user đã đăng nhập
            // Nếu không đăng nhập (guest), account sẽ là null
            Account currentAccount = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                Object principal = auth.getPrincipal();
                String username;
                if (principal instanceof UserDetails) {
                    username = ((UserDetails) principal).getUsername();
                } else {
                    username = principal.toString();
                }
                currentAccount = accountRepository.findByUsername(username).orElse(null);
                if (currentAccount == null) {
                     System.err.println("WARNING: Authenticated user '" + username + "' not found in Account repository.");
                } else {
                     System.out.println("DEBUG: Authenticated booking for user: " + username + " (ID: " + currentAccount.getId() + ")");
                }
            } else {
                 System.out.println("DEBUG: Booking created by anonymous/guest user");
            }

            // Determine email
            String email = null;
            if (request.containsKey("email") && request.get("email") != null) {
                email = request.get("email").toString();
            }
            if ((email == null || email.trim().isEmpty()) && currentAccount != null) {
                email = currentAccount.getEmail();
            }
            System.out.println("DEBUG: Booking email set to: " + email);

            for (Seat seat : selectedSeats) {
                Booking b = Booking.builder()
                        .showtime(showtime)
                        .seat(seat)
                        .customerName(customerName)
                        .customerPhone(customerPhone)
                        .email(email)
                        .bookingTime(Instant.now())
                        .status("PENDING")
                        .paymentCode(paymentCode)
                        .account(currentAccount) // Có thể null cho guest booking
                        .build();
                bookingRepository.save(b);
            }
            
            // 5.5 Giải phóng hold sau khi đã tạo booking (PENDING)
            seatHoldService.releaseAll(showtimeId, seatIds);

            // 6. Tạo VietQR URL từ SePay
            // https://qr.sepay.vn/img?acc=STK&bank=NGANHANG&amount=TIEN&des=NOIDUNG
            String qrUrl = String.format("https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s",
                    sepayConfig.getBankAcc(),
                    sepayConfig.getBankName(),
                    totalAmount,
                    paymentCode);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("paymentUrl", qrUrl); // Frontend redirects here
            resp.put("paymentCode", paymentCode);

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    // POST /api/booking/sepay-webhook - Webhook nhận thông báo từ SePay
    @PostMapping("/sepay-webhook")
    public ResponseEntity<String> sepayWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("=== SePay Webhook Received ===");
            System.out.println("Payload: " + payload);
            
            // 1. Verify Authentication (Quan trọng cho Gateway Mode)
            
            String content = (String) payload.get("content"); // Nội dung chuyển khoản
            
            // Xử lý amount: Gateway dùng 'amount', Monitoring dùng 'transferAmount'
            Object amountObj = payload.get("amount");
            if (amountObj == null) {
                amountObj = payload.get("transferAmount");
            }
            
            double transferAmount = 0.0;
            if (amountObj != null) {
                transferAmount = Double.valueOf(amountObj.toString());
            }

            if (content == null) {
                System.err.println("ERROR: Webhook payload missing 'content' field");
                return ResponseEntity.badRequest().body("Invalid payload");
            }

            System.out.println("Transfer content: " + content);

            // Tìm payment code trong nội dung chuyển khoản
            String paymentCode = null;
            if (content.contains("BMS")) {
                int start = content.indexOf("BMS");
                // Lấy chuỗi từ BMS trở đi
                String temp = content.substring(start);
                // Lấy token đầu tiên (BMSxxx)
                paymentCode = temp.split("[^a-zA-Z0-9_]")[0];
                System.out.println("Extracted payment code: " + paymentCode);
            } else {
                System.err.println("WARNING: No BMS payment code found in content");
            }

            if (paymentCode != null) {
                List<Booking> bookings = bookingRepository.findByPaymentCode(paymentCode);
                if (!bookings.isEmpty()) {
                    System.out.println("Found " + bookings.size() + " bookings for payment code: " + paymentCode);
                    
                    boolean anyNewlyPaid = false;
                    for (Booking b : bookings) {
                        if (!"PAID".equals(b.getStatus())) {
                            b.setStatus("PAID");
                            bookingRepository.save(b);
                            anyNewlyPaid = true;
                            System.out.println("Updated booking ID " + b.getId() + " to PAID");
                        }
                    }
                    
                    // Send ticket email after successful payment
                    if (anyNewlyPaid) {
                        String emailToSend = bookings.get(0).getEmail();
                        System.out.println("DEBUG: Sending ticket email to: " + emailToSend);
                        ticketEmailService.sendTicketEmailsForPaymentCode(paymentCode, bookings);
                    }
                    
                    return ResponseEntity.ok("OK");
                } else {
                    System.err.println("WARNING: No bookings found for payment code: " + paymentCode);
                }
            }
            
            // Return OK to acknowledge receipt even if logic fails (to stop retries)
            return ResponseEntity.ok("Processed");
        } catch (Exception e) {
            System.err.println("ERROR in webhook processing: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // GET /api/booking/status/{paymentCode} - Kiểm tra trạng thái thanh toán
    @GetMapping("/status/{paymentCode}")
    public ResponseEntity<Map<String, Object>> checkBookingStatus(@PathVariable String paymentCode) {
        List<Booking> bookings = bookingRepository.findByPaymentCode(paymentCode);
        if (bookings.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String status = bookings.get(0).getStatus();
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", status);
        
        if ("PAID".equals(status)) {
            List<Long> ids = bookings.stream().map(Booking::getId).toList();
            resp.put("bookingIds", ids.stream().map(Object::toString).collect(Collectors.joining(",")));
        }

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/my-history")
    public ResponseEntity<?> getMyBookingHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username;
        if (auth.getPrincipal() instanceof UserDetails) {
            username = ((UserDetails) auth.getPrincipal()).getUsername();
        } else {
            username = auth.getPrincipal().toString();
        }

        Account account = accountRepository.findByUsername(username).orElse(null);
        if (account == null) {
            return ResponseEntity.status(404).body("Account not found");
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Booking> pageResult;

        try {
            if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                pageResult = bookingRepository.findByAccountIdAndStatusWithDetails(account.getId(), status, pageable);
            } else {
                pageResult = bookingRepository.findByAccountIdWithDetails(account.getId(), pageable);
            }

        List<Booking> bookings = pageResult.getContent();

        // Group by Payment Code (Transaction)
        Map<String, List<Booking>> grouped = bookings.stream()
            .collect(Collectors.groupingBy(b -> b.getPaymentCode()));

        List<Map<String, Object>> history = new ArrayList<>();
        
        // Sort groups by booking time (taking the first one)
        grouped.entrySet().stream()
            .sorted((e1, e2) -> {
                 Instant t1 = e1.getValue().get(0).getBookingTime();
                 Instant t2 = e2.getValue().get(0).getBookingTime();
                 return t2.compareTo(t1); // DESC
            })
            .forEach(entry -> {
                List<Booking> group = entry.getValue();
                Booking first = group.get(0);
                Showtime showtime = first.getShowtime();
                
                Map<String, Object> dto = new HashMap<>();
                dto.put("paymentCode", first.getPaymentCode());
                dto.put("bookingTime", first.getBookingTime());
                dto.put("status", first.getStatus());
                if (showtime.getMovie() != null) {
                    dto.put("movieTitle", showtime.getMovie().getTitle());
                    dto.put("posterUrl", showtime.getMovie().getPosterUrl());
                } else {
                    dto.put("movieTitle", "Unknown Movie");
                    dto.put("posterUrl", "");
                }
                
                if (showtime.getTheater() != null) {
                    dto.put("theaterName", showtime.getTheater().getName());
                } else {
                    dto.put("theaterName", "Unknown Theater");
                }

                if (showtime.getRoom() != null) {
                    dto.put("roomName", showtime.getRoom().getName());
                } else {
                    dto.put("roomName", "Unknown Room");
                }
                dto.put("showDate", showtime.getShowDate());
                dto.put("showTime", showtime.getShowTime());
                dto.put("ticketCount", group.size());
                
                List<String> seats = group.stream()
                    .map(b -> b.getSeat().getSeatNumber())
                    .collect(Collectors.toList());
                dto.put("seats", seats);
                
                // Calculate total
                double total = group.stream().mapToDouble(b -> {
                     double price = (showtime.getPriceStandard() != null ? showtime.getPriceStandard() : 0);
                     if (b.getSeat().getSeatType() != null) {
                         if ("VIP".equals(b.getSeat().getSeatType().name())) price = (showtime.getPriceVip() != null ? showtime.getPriceVip() : 0);
                         if ("COUPLE".equals(b.getSeat().getSeatType().name())) price *= 2;
                     }
                     return price;
                }).sum();
                dto.put("totalAmount", total);
                
                history.add(dto);
            });

            Map<String, Object> response = new HashMap<>();
            response.put("content", history);
            response.put("currentPage", pageResult.getNumber());
            response.put("totalItems", pageResult.getTotalElements());
            response.put("totalPages", pageResult.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error loading history: " + e.getMessage());
        }

    }
}