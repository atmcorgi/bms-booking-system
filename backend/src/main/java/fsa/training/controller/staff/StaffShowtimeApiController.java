package fsa.training.controller.staff;

import fsa.training.entity.Showtime;
import fsa.training.entity.Movie;
import fsa.training.entity.Room;
import fsa.training.repository.booking.ShowtimeRepository;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.theater.RoomRepository;
import fsa.training.security.TheaterPermissionEvaluator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/staff/showtimes")
public class StaffShowtimeApiController {
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final TheaterPermissionEvaluator permissionEvaluator;

    public StaffShowtimeApiController(ShowtimeRepository showtimeRepository,
                                     MovieRepository movieRepository,
                                     RoomRepository roomRepository,
                                     TheaterPermissionEvaluator permissionEvaluator) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
        this.roomRepository = roomRepository;
        this.permissionEvaluator = permissionEvaluator;
    }

    /**
     * List showtimes for staff's assigned theater
     * GET /api/staff/showtimes?startDate=2026-01-01&endDate=2026-01-31&movieId=5&roomId=2&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        
        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null || !permissionEvaluator.canManageTheater(auth.getName(), theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        // Parse dates
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(7);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now().plusDays(30);

        // Get all showtimes for theater and apply filters
        List<Showtime> allShowtimes = showtimeRepository.findAll().stream()
                .filter(s -> s.getTheater().getId().equals(theaterId))
                .filter(s -> !s.getShowDate().isBefore(start) && !s.getShowDate().isAfter(end))
                .filter(s -> movieId == null || (s.getMovie() != null && s.getMovie().getId().equals(movieId)))
                .filter(s -> roomId == null || (s.getRoom() != null && s.getRoom().getId().equals(roomId)))
                .sorted(Comparator.comparing(Showtime::getShowDate).reversed()
                        .thenComparing(Showtime::getShowTime))
                .toList();

        // Manual pagination
        int totalItems = allShowtimes.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalItems);
        List<Showtime> pageContent = fromIndex < totalItems ? allShowtimes.subList(fromIndex, toIndex) : List.of();

        // Map to response
        List<Map<String, Object>> items = new ArrayList<>();
        for (Showtime s : pageContent) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("showDate", s.getShowDate().toString());
            m.put("showTime", s.getShowTime().toString());
            m.put("priceStandard", s.getPriceStandard());
            m.put("priceVip", s.getPriceVip());
            
            if (s.getMovie() != null) {
                m.put("movieId", s.getMovie().getId());
                m.put("movieCode", s.getMovie().getCode());
                m.put("movieTitle", s.getMovie().getTitle());
                m.put("duration", s.getMovie().getDuration());
            }
            
            if (s.getRoom() != null) {
                m.put("roomId", s.getRoom().getId());
                m.put("roomName", s.getRoom().getName());
            }
            
            if (s.getTheater() != null) {
                m.put("theaterId", s.getTheater().getId());
                m.put("theaterName", s.getTheater().getName());
            }
            
            items.add(m);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("total", totalItems);
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) totalItems / size));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get showtime by ID
     * GET /api/staff/showtimes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, Authentication auth) {
        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        Optional<Showtime> showtimeOpt = showtimeRepository.findById(id);
        if (showtimeOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Showtime not found"));
        }

        Showtime s = showtimeOpt.get();
        if (!s.getTheater().getId().equals(theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your theater"));
        }

        Map<String, Object> m = new HashMap<>();
        m.put("id", s.getId());
        m.put("showDate", s.getShowDate().toString());
        m.put("showTime", s.getShowTime().toString());
        m.put("priceStandard", s.getPriceStandard());
        m.put("priceVip", s.getPriceVip());
        m.put("movieId", s.getMovie() != null ? s.getMovie().getId() : null);
        m.put("roomId", s.getRoom() != null ? s.getRoom().getId() : null);
        m.put("theaterId", s.getTheater() != null ? s.getTheater().getId() : null);
        
        return ResponseEntity.ok(m);
    }

    /**
     * Update showtime (only price and time)
     * PUT /api/staff/showtimes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        Optional<Showtime> showtimeOpt = showtimeRepository.findById(id);
        if (showtimeOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Showtime not found"));
        }

        Showtime s = showtimeOpt.get();
        if (!s.getTheater().getId().equals(theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your theater"));
        }

        // Update allowed fields
        if (body.containsKey("priceStandard")) {
            s.setPriceStandard((Integer) body.get("priceStandard"));
        }
        if (body.containsKey("priceVip")) {
            s.setPriceVip((Integer) body.get("priceVip"));
        }
        if (body.containsKey("showTime")) {
            s.setShowTime(LocalTime.parse((String) body.get("showTime")));
        }

        showtimeRepository.save(s);
        return ResponseEntity.ok(Map.of("message", "Updated successfully", "id", id));
    }

    /**
     * Delete showtime
     * DELETE /api/staff/showtimes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        Optional<Showtime> showtimeOpt = showtimeRepository.findById(id);
        if (showtimeOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Showtime not found"));
        }

        Showtime s = showtimeOpt.get();
        if (!s.getTheater().getId().equals(theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your theater"));
        }

        // Check if showtime has any bookings
        // TODO: Add validation to prevent deleting showtimes with existing bookings
        
        showtimeRepository.delete(s);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}
