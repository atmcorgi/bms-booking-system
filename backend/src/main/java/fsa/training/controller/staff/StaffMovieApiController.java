package fsa.training.controller.staff;

import fsa.training.dto.movie.MovieStatusProjection;
import fsa.training.service.movie.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import fsa.training.entity.Movie;
import fsa.training.entity.MovieRequest;
import fsa.training.entity.Theater;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.dto.staff.MovieRequestCreateDto;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffMovieApiController {

    @Autowired
    private MovieService movieService;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private MovieRequestRepository movieRequestRepository;

    @GetMapping("/movies/assigned")
    public ResponseEntity<Map<String, Object>> getAssignedMovies(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            org.springframework.security.core.Authentication authentication) {
        
        String username = authentication.getName();
        Page<MovieStatusProjection> assignedMovies = staffWorkflowService.getAllAssignedMovies(username, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("movies", assignedMovies.getContent());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", assignedMovies.getTotalPages());
        response.put("totalItems", assignedMovies.getTotalElements());
        response.put("hasMore", !assignedMovies.isLast());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/movie-requests")
    public ResponseEntity<?> listRequests(
            org.springframework.security.core.Authentication authentication,
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String username = authentication.getName();
        Long theaterId = staffWorkflowService.getAssignedTheaterId(username);
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var results = movieRequestRepository.findByStatusAndTheater_Id(status, theaterId, pageable);
        Map<String, Object> res = new java.util.HashMap<>();
        res.put("items", results.getContent());
        res.put("page", page);
        res.put("totalPages", results.getTotalPages());
        res.put("totalItems", results.getTotalElements());
        return ResponseEntity.ok(res);
    }
    @GetMapping("/movies/scheduled")
    public ResponseEntity<Map<String, Object>> getScheduledMovies(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            org.springframework.security.core.Authentication authentication) {
        
        String username = authentication.getName();
        Page<MovieStatusProjection> scheduledMovies = staffWorkflowService.getMoviesByStatus(username, "SCHEDULED", page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("movies", scheduledMovies.getContent());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", scheduledMovies.getTotalPages());
        response.put("totalItems", scheduledMovies.getTotalElements());
        response.put("hasMore", !scheduledMovies.isLast());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/movies/published")
    public ResponseEntity<Map<String, Object>> getPublishedMovies(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            org.springframework.security.core.Authentication authentication) {
        
        String username = authentication.getName();
        Page<MovieStatusProjection> publishedMovies = staffWorkflowService.getMoviesByStatus(username, "PUBLISHED", page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("movies", publishedMovies.getContent());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", publishedMovies.getTotalPages());
        response.put("totalItems", publishedMovies.getTotalElements());
        response.put("hasMore", !publishedMovies.isLast());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/movies/requests")
    public ResponseEntity<?> createMovieRequest(
            org.springframework.security.core.Authentication authentication,
            @RequestBody @jakarta.validation.Valid MovieRequestCreateDto body) {
        String username = authentication.getName();
        Long theaterId = staffWorkflowService.getAssignedTheaterId(username);
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        Long movieId = body.getMovieId();

        Movie movie = movieRepository.findById(movieId).orElse(null);
        if (movie == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Movie not found"));
        }

        Theater theater = theaterRepository.findById(theaterId).orElse(null);
        if (theater == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Theater not found"));
        }

        // Prevent duplicate request for same movie+theater when still active
        var existingReq = movieRequestRepository.findFirstByMovie_CodeAndTheater_Id(movie.getCode(), theaterId);
        if (existingReq.isPresent() && !"REJECTED".equalsIgnoreCase(existingReq.get().getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Yêu cầu cho phim này đã tồn tại"));
        }

        Integer priority = body.getPriority() != null ? body.getPriority() : 0;
        Double demandScore = body.getDemandScore() != null ? body.getDemandScore() : 0.0;

        MovieRequest req = MovieRequest.builder()
                .movie(movie)
                .movieCode(movie.getCode())
                .priority(priority)
                .demandScore(demandScore)
                .theater(theater)
                .createdBy(username)
                .status("PENDING")
                .build();

        MovieRequest saved = movieRequestRepository.save(req);
        return ResponseEntity.ok(Map.of("id", saved.getId()));
    }

    @PatchMapping("/movies/requests/{id}")
    public ResponseEntity<?> updateMovieRequest(
            org.springframework.security.core.Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        String username = authentication.getName();
        Long theaterId = staffWorkflowService.getAssignedTheaterId(username);
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }
        var opt = movieRequestRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        }
        MovieRequest req = opt.get();
        if (req.getTheater() == null || !theaterId.equals(req.getTheater().getId())) {
            return ResponseEntity.status(404).body(Map.of("error", "Request not found for your theater"));
        }
        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chỉ sửa yêu cầu ở trạng thái PENDING"));
        }
        if (updates.containsKey("priority")) {
            Object p = updates.get("priority");
            if (p != null) req.setPriority(((Number)p).intValue());
        }
        if (updates.containsKey("demandScore")) {
            Object d = updates.get("demandScore");
            if (d != null) req.setDemandScore(((Number)d).doubleValue());
        }
        MovieRequest saved = movieRequestRepository.save(req);
        return ResponseEntity.ok(Map.of("id", saved.getId()));
    }

    @DeleteMapping("/movies/requests/{id}")
    public ResponseEntity<?> deleteMovieRequest(
            org.springframework.security.core.Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        Long theaterId = staffWorkflowService.getAssignedTheaterId(username);
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }
        var opt = movieRequestRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        }
        MovieRequest req = opt.get();
        if (req.getTheater() == null || !theaterId.equals(req.getTheater().getId())) {
            return ResponseEntity.status(404).body(Map.of("error", "Request not found for your theater"));
        }
        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chỉ xoá yêu cầu ở trạng thái PENDING"));
        }
        movieRequestRepository.delete(req);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @PostMapping("/movies/publish")
    public ResponseEntity<Map<String, Object>> publishMovies(@RequestBody Map<String, Object> body) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Long theaterId = staffWorkflowService.getAssignedTheaterId(username);
        
        if (theaterId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Tài khoản STAFF chưa được gán rạp. Liên hệ ADMIN."
            ));
        }
        
        @SuppressWarnings("unchecked")
        List<String> movieCodes = (List<String>) body.get("movieCodes");
        
        if (movieCodes == null || movieCodes.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Danh sách mã phim không được để trống."
            ));
        }
        
        try {
            int publishedCount = 0;
            for (String movieCode : movieCodes) {
                // Chỉ publish phim đã được assign cho theater này và đang ở trạng thái SCHEDULED
                if (movieService.publishMovieForTheater(movieCode, theaterId)) {
                    publishedCount++;
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã publish " + publishedCount + " phim thành công!",
                "publishedCount", publishedCount,
                "totalRequested", movieCodes.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Lỗi khi publish phim: " + e.getMessage()
            ));
        }
    }
}