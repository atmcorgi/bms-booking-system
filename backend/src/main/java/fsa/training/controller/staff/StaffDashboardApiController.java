package fsa.training.controller.staff;

import fsa.training.entity.Showtime;
import fsa.training.entity.Theater;
import fsa.training.repository.booking.ShowtimeRepository;
import fsa.training.repository.movie.MovieAssignmentRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.security.TheaterPermissionEvaluator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/dashboard")
public class StaffDashboardApiController {
    private final TheaterPermissionEvaluator permissionEvaluator;
    private final TheaterRepository theaterRepository;
    private final MovieAssignmentRepository movieAssignmentRepository;
    private final ShowtimeRepository showtimeRepository;

    public StaffDashboardApiController(TheaterPermissionEvaluator permissionEvaluator,
                                       TheaterRepository theaterRepository,
                                       MovieAssignmentRepository movieAssignmentRepository,
                                       ShowtimeRepository showtimeRepository) {
        this.permissionEvaluator = permissionEvaluator;
        this.theaterRepository = theaterRepository;
        this.movieAssignmentRepository = movieAssignmentRepository;
        this.showtimeRepository = showtimeRepository;
    }

    @GetMapping
    public ResponseEntity<?> get(Authentication auth) {
        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null || !permissionEvaluator.canManageTheater(auth.getName(), theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }
        Theater theater = theaterRepository.findById(theaterId).orElse(null);
        if (theater == null) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", "Theater not found"));
        }

        var assignments = movieAssignmentRepository.findAllWithMovieByTheater(theaterId).stream()
                .map(ma -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("code", ma.getMovie().getCode());
                    m.put("title", ma.getMovie().getTitle());
                    m.put("activeFrom", ma.getActiveFrom());
                    m.put("activeTo", ma.getActiveTo());
                    return m;
                }).collect(Collectors.toList());

        LocalDate today = LocalDate.now();
        LocalDate weekEnd = today.plusDays(6);
        List<Showtime> todayShows = showtimeRepository.findByTheaterNameAndShowDate(theater.getName(), today);
        var weekShows = new java.util.ArrayList<Map<String, Object>>();
        LocalDate cur = today;
        while (!cur.isAfter(weekEnd)) {
            for (Showtime s : showtimeRepository.findByTheaterNameAndShowDate(theater.getName(), cur)) {
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("date", s.getShowDate().toString());
                m.put("time", s.getShowTime().toString());
                m.put("room", s.getRoom().getName());
                m.put("movie", s.getMovie().getTitle());
                weekShows.add(m);
            }
            cur = cur.plusDays(1);
        }

        Map<String, Object> out = new java.util.HashMap<>();
        {
            java.util.Map<String, Object> t = new java.util.HashMap<>();
            t.put("id", theater.getId());
            t.put("name", theater.getName());
            t.put("code", theater.getCode());
            t.put("address", theater.getAddress());
            out.put("theater", t);
        }
        out.put("assignments", assignments);
        out.put("todayShowtimes", todayShows.stream().map(s -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("time", s.getShowTime().toString());
            m.put("room", s.getRoom().getName());
            m.put("movie", s.getMovie().getTitle());
            return m;
        }).toList());
        out.put("weekShowtimes", weekShows);
        return ResponseEntity.ok(out);
    }
}


