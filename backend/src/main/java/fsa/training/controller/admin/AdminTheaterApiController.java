package fsa.training.controller.admin;

import fsa.training.entity.District;
import fsa.training.entity.Province;
import fsa.training.entity.Theater;
import fsa.training.repository.booking.BookingRepository;
import fsa.training.repository.booking.SeatRepository;
import fsa.training.repository.booking.ShowtimeRepository;
import fsa.training.repository.theater.DistrictRepository;
import fsa.training.repository.theater.ProvinceRepository;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.service.theater.TheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import fsa.training.repository.theater.TheaterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin")
public class AdminTheaterApiController {

    @Autowired
    private TheaterService theaterService;

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private BookingRepository bookingRepository;


    @GetMapping("/theaters")
    public Map<String, Object> list(Authentication authentication,
                                    @RequestParam(value = "q", required = false) String q,
                                    @RequestParam(value = "page", defaultValue = "0") int page,
                                    @RequestParam(value = "size", defaultValue = "10") int size) {
        List<Theater> all = theaterService.getTheatersForUser(authentication.getName());
        if (q != null && !q.isBlank()) {
            all = all.stream()
                    .filter(t -> (t.getName() != null && t.getName().toLowerCase().contains(q.toLowerCase()))
                            || (t.getCode() != null && t.getCode().toLowerCase().contains(q.toLowerCase())))
                    .collect(Collectors.toList());
        }
        int from = Math.max(0, Math.min(page * size, all.size()));
        int to = Math.max(from, Math.min(from + size, all.size()));
        List<Theater> slice = all.subList(from, to);
        int totalPages = (int) Math.ceil(all.size() / (double) size);
        return Map.of(
                "items", slice.stream().map(this::toTheater).collect(Collectors.toList()),
                "page", page,
                "size", size,
                "totalPages", totalPages,
                "totalItems", all.size()
        );
    }

    @GetMapping("/theaters/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return theaterService.getByIdWithRelations(id)
                .<ResponseEntity<?>>map(t -> ResponseEntity.ok(toTheater(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/theaters/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Theater t = theaterService.getByIdWithRelations(id).orElseThrow(() -> new IllegalArgumentException("Theater not found"));
            if (body.containsKey("name")) t.setName(String.valueOf(body.get("name")));
            if (body.containsKey("code")) t.setCode(String.valueOf(body.get("code")));
            if (body.containsKey("address")) t.setAddress(String.valueOf(body.get("address")));
            if (body.containsKey("phone")) t.setPhone(String.valueOf(body.get("phone")));
            if (body.containsKey("description")) t.setDescription(String.valueOf(body.get("description")));
            if (body.containsKey("latitude")) t.setLatitude(Double.valueOf(String.valueOf(body.get("latitude"))));
            if (body.containsKey("longitude")) t.setLongitude(Double.valueOf(String.valueOf(body.get("longitude"))));
            if (body.containsKey("openTime")) t.setOpenTime(java.time.LocalTime.parse(String.valueOf(body.get("openTime"))));
            if (body.containsKey("closeTime")) t.setCloseTime(java.time.LocalTime.parse(String.valueOf(body.get("closeTime"))));
            if (body.containsKey("provinceId")) {
                Long provinceId = Long.valueOf(String.valueOf(body.get("provinceId")));
                Province province = provinceRepository.findById(provinceId).orElse(null);
                if (province != null) {
                    t.setProvince(province);
                }
            }
            if (body.containsKey("districtId")) {
                Long districtId = Long.valueOf(String.valueOf(body.get("districtId")));
                District district = districtRepository.findById(districtId).orElse(null);
                if (district != null) {
                    t.setDistrict(district);
                }
            }
            Theater saved = theaterRepository.save(t);
            return ResponseEntity.ok(toTheater(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/theaters/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            theaterService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/theaters")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            String brand = String.valueOf(body.getOrDefault("brand", "CGV"));
            String theaterName = String.valueOf(body.get("name"));
            String theaterCode = String.valueOf(body.get("code"));
            String address = String.valueOf(body.get("address"));
            String phone = String.valueOf(body.getOrDefault("phone", ""));
            String description = String.valueOf(body.getOrDefault("description", ""));
            Double latitude = body.containsKey("latitude") ? Double.valueOf(String.valueOf(body.get("latitude"))) : null;
            Double longitude = body.containsKey("longitude") ? Double.valueOf(String.valueOf(body.get("longitude"))) : null;
            String openTime = String.valueOf(body.getOrDefault("openTime", "08:00"));
            String closeTime = String.valueOf(body.getOrDefault("closeTime", "23:00"));
            Long provinceId = Long.valueOf(String.valueOf(body.get("provinceId")));
            Long districtId = Long.valueOf(String.valueOf(body.get("districtId")));

            @SuppressWarnings("unchecked")
            List<String> roomNames = (List<String>) body.getOrDefault("roomNames", List.of());
            Integer seatsPerRoom = Integer.valueOf(String.valueOf(body.getOrDefault("seatsPerRoom", 0)));

            Province province = provinceRepository.findById(provinceId)
                    .orElseThrow(() -> new IllegalArgumentException("Province not found"));
            District district = districtRepository.findById(districtId)
                    .orElseThrow(() -> new IllegalArgumentException("District not found"));

            Theater theater = theaterService.createTheaterWithBrand(
                    brand, theaterName, theaterCode, address, phone, description,
                    province, district, roomNames, seatsPerRoom
            );
            
            // Set additional fields
            theater.setLatitude(latitude);
            theater.setLongitude(longitude);
            theater.setOpenTime(java.time.LocalTime.parse(openTime));
            theater.setCloseTime(java.time.LocalTime.parse(closeTime));
            theater.setProvince(province);
            theater.setDistrict(district);
            
            Theater saved = theaterRepository.save(theater);
            return ResponseEntity.created(URI.create("/api/admin/theaters/" + saved.getId())).body(toTheater(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toTheater(Theater t) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", t.getId());
        m.put("name", t.getName());
        m.put("code", t.getCode());
        m.put("address", t.getAddress());
        m.put("phone", t.getPhone());
        m.put("description", t.getDescription());
        m.put("latitude", t.getLatitude());
        m.put("longitude", t.getLongitude());
        m.put("openTime", t.getOpenTime() != null ? t.getOpenTime().toString() : null);
        m.put("closeTime", t.getCloseTime() != null ? t.getCloseTime().toString() : null);
        if (t.getProvince() != null) {
            m.put("province", Map.of("id", t.getProvince().getId(), "name", t.getProvince().getName()));
        }
        if (t.getDistrict() != null) {
            m.put("district", Map.of("id", t.getDistrict().getId(), "name", t.getDistrict().getName()));
        }
        m.put("roomCount", roomRepository.countByTheaterId(t.getId()));
        m.put("seatCount", seatRepository.countByTheaterId(t.getId()));
        m.put("showtimeCount", showtimeRepository.countByTheaterId(t.getId()));
        m.put("bookingCount", bookingRepository.countByShowtime_Theater_Id(t.getId()));
        return m;
    }



    @GetMapping("/theaters/{id}/showtimes")
    public ResponseEntity<?> getShowtimes(@PathVariable Long id,
                                          @RequestParam(required = false) Long roomId,
                                          @RequestParam(required = false) String startDate,
                                          @RequestParam(required = false) String endDate,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        
        LocalDate start = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null && !endDate.isBlank()) ? LocalDate.parse(endDate) : null;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "showDate", "showTime"));
        
        Page<fsa.training.entity.Showtime> showtimePage = showtimeRepository.findShowtimes(id, roomId, start, end, pageable);
        
        List<Map<String, Object>> items = showtimePage.getContent().stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("showDate", s.getShowDate());
            m.put("showTime", s.getShowTime());
            m.put("priceStandard", s.getPriceStandard());
            m.put("priceVip", s.getPriceVip());
            if (s.getMovie() != null) {
                m.put("movieCode", s.getMovie().getCode());
                m.put("movieTitle", s.getMovie().getTitle());
            }
             if (s.getRoom() != null) {
                m.put("roomId", s.getRoom().getId());
                m.put("roomName", s.getRoom().getName());
            }
            return m;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of(
            "items", items,
            "page", showtimePage.getNumber(),
            "size", showtimePage.getSize(),
            "totalPages", showtimePage.getTotalPages(),
            "totalItems", showtimePage.getTotalElements()
        ));
    }

}

