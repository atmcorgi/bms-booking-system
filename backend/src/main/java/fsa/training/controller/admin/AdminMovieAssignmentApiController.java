package fsa.training.controller.admin;

import fsa.training.entity.Movie;
import fsa.training.entity.MovieAssignment;
import fsa.training.entity.Theater;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.MovieAssignmentRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.repository.auth.AccountPermissionRepository;
import fsa.training.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/theaters/{theaterId}/movies")
public class AdminMovieAssignmentApiController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminMovieAssignmentApiController.class);
    
    private final MovieAssignmentRepository movieAssignmentRepository;
    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final NotificationService notificationService;

    public AdminMovieAssignmentApiController(MovieAssignmentRepository movieAssignmentRepository,
                                             TheaterRepository theaterRepository,
                                             MovieRepository movieRepository,
                                             AccountPermissionRepository accountPermissionRepository,
                                             NotificationService notificationService) {
        this.movieAssignmentRepository = movieAssignmentRepository;
        this.theaterRepository = theaterRepository;
        this.movieRepository = movieRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Map<String, Object>> list(@PathVariable Long theaterId) {
        return movieAssignmentRepository.findAllWithMovieByTheater(theaterId).stream().map(ma -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", ma.getId());
            m.put("movieId", ma.getMovie().getId());
            m.put("movieCode", ma.getMovie().getCode());
            m.put("title", ma.getMovie().getTitle());
            m.put("activeFrom", ma.getActiveFrom());
            m.put("activeTo", ma.getActiveTo());
            m.put("formats", ma.getFormats());
            m.put("languages", ma.getLanguages());
            return m;
        }).collect(Collectors.toList());
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assign(@PathVariable Long theaterId, @RequestBody Map<String, Object> body) {
        String movieCode = String.valueOf(body.get("movieCode"));
        LocalDate activeFrom = parseDate(body.get("activeFrom"));
        LocalDate activeTo = parseDate(body.get("activeTo"));
        String formats = body.get("formats") != null ? String.valueOf(body.get("formats")) : null;
        String languages = body.get("languages") != null ? String.valueOf(body.get("languages")) : null;

        Theater theater = theaterRepository.findById(theaterId).orElseThrow();
        Movie movie = movieRepository.findByCode(movieCode).orElseThrow();

        MovieAssignment ma = movieAssignmentRepository.findFirstByTheater_IdAndMovie_Id(theaterId, movie.getId())
                .orElseGet(MovieAssignment::new);
        ma.setTheater(theater);
        ma.setMovie(movie);
        ma.setActiveFrom(activeFrom);
        ma.setActiveTo(activeTo);
        ma.setFormats(formats);
        ma.setLanguages(languages);
        movieAssignmentRepository.save(ma);

        // Get staff usernames for this theater
        List<String> staff = accountPermissionRepository.findByAssignedTheaterId(theaterId).stream()
                .map(ap -> ap.getAccount().getUsername()).toList();

        // Create notifications for all staff members
        if (!staff.isEmpty()) {
            String assignedBy = SecurityContextHolder.getContext().getAuthentication().getName();
            notificationService.createMovieAssignmentNotificationsForMultipleStaff(
                    movie.getTitle(),
                    theater.getName(),
                    assignedBy,
                    staff,
                    movie.getId(),
                    theaterId
            ).thenAccept(notifications -> {
                logger.info("✅ Đã tạo {} notifications cho staff của rạp {}", notifications.size(), theater.getName());
            }).exceptionally(throwable -> {
                logger.error("❌ Lỗi khi tạo notifications cho rạp {}: {}", theater.getName(), throwable.getMessage(), throwable);
                return null;
            });
        }

        java.util.Map<String, Object> ok = new java.util.HashMap<>();
        ok.put("success", true);
        ok.put("notified", staff);
        ok.put("notificationCount", staff.size());
        return ResponseEntity.ok(ok);
    }

    @DeleteMapping("/{movieCode}")
    public ResponseEntity<?> unassign(@PathVariable Long theaterId, @PathVariable String movieCode) {
        Movie movie = movieRepository.findByCode(movieCode).orElseThrow();
        movieAssignmentRepository.findFirstByTheater_IdAndMovie_Id(theaterId, movie.getId())
                .ifPresent(movieAssignmentRepository::delete);
        java.util.Map<String, Object> ok = new java.util.HashMap<>();
        ok.put("success", true);
        return ResponseEntity.ok(ok);
    }

    private LocalDate parseDate(Object v) {
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        if (s.isEmpty()) return null;
        return LocalDate.parse(s);
    }
}


