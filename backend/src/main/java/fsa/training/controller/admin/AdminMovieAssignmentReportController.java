package fsa.training.controller.admin;

import fsa.training.entity.MovieAssignment;
import fsa.training.repository.movie.MovieAssignmentRepository;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.theater.TheaterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/movie-assignments")
public class AdminMovieAssignmentReportController {

    private final MovieAssignmentRepository movieAssignmentRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;

    public AdminMovieAssignmentReportController(
            MovieAssignmentRepository movieAssignmentRepository,
            MovieRepository movieRepository,
            TheaterRepository theaterRepository) {
        this.movieAssignmentRepository = movieAssignmentRepository;
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
    }

    /**
     * List all movie assignments with pagination and filtering
     */
    @GetMapping
    public Map<String, Object> list(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "theaterId", required = false) Long theaterId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "DESC") String sortDir) {

        // Get all assignments
        List<MovieAssignment> all = movieAssignmentRepository.findAll();

        // Filter by theater if provided
        if (theaterId != null) {
            all = all.stream()
                    .filter(ma -> ma.getTheater() != null && ma.getTheater().getId().equals(theaterId))
                    .collect(Collectors.toList());
        }

        // Filter by search query (movie title or theater name)
        if (q != null && !q.isBlank()) {
            String query = q.toLowerCase();
            all = all.stream()
                    .filter(ma -> {
                        String movieTitle = ma.getMovie() != null ? ma.getMovie().getTitle() : "";
                        String theaterName = ma.getTheater() != null ? ma.getTheater().getName() : "";
                        return movieTitle.toLowerCase().contains(query) || 
                               theaterName.toLowerCase().contains(query);
                    })
                    .collect(Collectors.toList());
        }

        // Manual sorting
        if ("id".equals(sortBy)) {
            all.sort((a, b) -> "ASC".equals(sortDir) ? 
                    a.getId().compareTo(b.getId()) : 
                    b.getId().compareTo(a.getId()));
        } else if ("movieTitle".equals(sortBy)) {
            all.sort((a, b) -> {
                String aTitle = a.getMovie() != null ? a.getMovie().getTitle() : "";
                String bTitle = b.getMovie() != null ? b.getMovie().getTitle() : "";
                return "ASC".equals(sortDir) ? aTitle.compareTo(bTitle) : bTitle.compareTo(aTitle);
            });
        } else if ("theaterName".equals(sortBy)) {
            all.sort((a, b) -> {
                String aName = a.getTheater() != null ? a.getTheater().getName() : "";
                String bName = b.getTheater() != null ? b.getTheater().getName() : "";
                return "ASC".equals(sortDir) ? aName.compareTo(bName) : bName.compareTo(aName);
            });
        }

        // Manual pagination
        int from = Math.max(0, Math.min(page * size, all.size()));
        int to = Math.max(from, Math.min(from + size, all.size()));
        List<MovieAssignment> slice = all.subList(from, to);
        int totalPages = (int) Math.ceil(all.size() / (double) size);

        // Convert to DTOs
        List<Map<String, Object>> items = slice.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", totalPages);
        response.put("totalItems", all.size());

        return response;
    }

    /**
     * Get single assignment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return movieAssignmentRepository.findById(id)
                .map(ma -> ResponseEntity.ok(toDto(ma)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new movie assignment
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            Long movieId = Long.valueOf(String.valueOf(payload.get("movieId")));
            Long theaterId = Long.valueOf(String.valueOf(payload.get("theaterId")));
            
            var movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new IllegalArgumentException("Movie not found"));
            var theater = theaterRepository.findById(theaterId)
                    .orElseThrow(() -> new IllegalArgumentException("Theater not found"));

            // Check if assignment already exists
            if (movieAssignmentRepository.existsByMovie_IdAndTheater_Id(movieId, theaterId)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Phim này đã được gán cho rạp này rồi"
                ));
            }

            MovieAssignment ma = new MovieAssignment();
            ma.setMovie(movie);
            ma.setTheater(theater);
            
            if (payload.containsKey("activeFrom") && payload.get("activeFrom") != null) {
                ma.setActiveFrom(LocalDate.parse(String.valueOf(payload.get("activeFrom"))));
            }
            if (payload.containsKey("activeTo") && payload.get("activeTo") != null) {
                ma.setActiveTo(LocalDate.parse(String.valueOf(payload.get("activeTo"))));
            }
            if (payload.containsKey("formats") && payload.get("formats") != null) {
                ma.setFormats(String.valueOf(payload.get("formats")));
            }
            if (payload.containsKey("languages") && payload.get("languages") != null) {
                ma.setLanguages(String.valueOf(payload.get("languages")));
            }

            movieAssignmentRepository.save(ma);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", toDto(ma)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Update existing movie assignment
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return movieAssignmentRepository.findById(id)
                .map(ma -> {
                    if (payload.containsKey("activeFrom")) {
                        Object value = payload.get("activeFrom");
                        ma.setActiveFrom(value != null && !String.valueOf(value).isBlank() 
                            ? LocalDate.parse(String.valueOf(value)) : null);
                    }
                    if (payload.containsKey("activeTo")) {
                        Object value = payload.get("activeTo");
                        ma.setActiveTo(value != null && !String.valueOf(value).isBlank() 
                            ? LocalDate.parse(String.valueOf(value)) : null);
                    }
                    if (payload.containsKey("formats")) {
                        ma.setFormats(payload.get("formats") != null ? String.valueOf(payload.get("formats")) : null);
                    }
                    if (payload.containsKey("languages")) {
                        ma.setLanguages(payload.get("languages") != null ? String.valueOf(payload.get("languages")) : null);
                    }

                    movieAssignmentRepository.save(ma);

                    return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", toDto(ma)
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete movie assignment
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return movieAssignmentRepository.findById(id)
                .map(ma -> {
                    movieAssignmentRepository.delete(ma);
                    return ResponseEntity.ok(Map.of("success", true));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toDto(MovieAssignment ma) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", ma.getId());
        
        if (ma.getMovie() != null) {
            dto.put("movieId", ma.getMovie().getId());
            dto.put("movieCode", ma.getMovie().getCode());
            dto.put("movieTitle", ma.getMovie().getTitle());
            dto.put("moviePosterUrl", ma.getMovie().getPosterUrl());
            dto.put("movieDuration", ma.getMovie().getDuration());
        }
        
        if (ma.getTheater() != null) {
            dto.put("theaterId", ma.getTheater().getId());
            dto.put("theaterName", ma.getTheater().getName());
            dto.put("theaterCode", ma.getTheater().getCode());
        }
        
        dto.put("activeFrom", ma.getActiveFrom());
        dto.put("activeTo", ma.getActiveTo());
        dto.put("formats", ma.getFormats());
        dto.put("languages", ma.getLanguages());
        
        return dto;
    }
}
