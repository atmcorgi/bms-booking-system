package fsa.training.controller.admin;

import fsa.training.entity.MovieRequest;
import fsa.training.repository.movie.MovieRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/movie-requests")
public class AdminMovieRequestReportController {

    private final MovieRequestRepository movieRequestRepository;

    public AdminMovieRequestReportController(MovieRequestRepository movieRequestRepository) {
        this.movieRequestRepository = movieRequestRepository;
    }

    /**
     * List all movie requests with pagination and filtering
     */
    @GetMapping
    public Map<String, Object> list(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "theaterId", required = false) Long theaterId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        // Get all requests
        List<MovieRequest> all = movieRequestRepository.findAll();

        // Filter by status
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            all = all.stream()
                    .filter(r -> status.equalsIgnoreCase(r.getStatus()))
                    .collect(Collectors.toList());
        }

        // Filter by theater
        if (theaterId != null) {
            all = all.stream()
                    .filter(r -> r.getTheater() != null && r.getTheater().getId().equals(theaterId))
                    .collect(Collectors.toList());
        }

        // Filter by search query
        if (q != null && !q.isBlank()) {
            String query = q.toLowerCase();
            all = all.stream()
                    .filter(r -> {
                        String movieTitle = r.getMovie() != null ? r.getMovie().getTitle() : "";
                        String theaterName = r.getTheater() != null ? r.getTheater().getName() : "";
                        return movieTitle.toLowerCase().contains(query) || 
                               theaterName.toLowerCase().contains(query);
                    })
                    .collect(Collectors.toList());
        }

        // Sort by createdAt DESC
        all.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        // Manual pagination
        int from = Math.max(0, Math.min(page * size, all.size()));
        int to = Math.max(from, Math.min(from + size, all.size()));
        List<MovieRequest> slice = all.subList(from, to);
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
     * Get single request by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return movieRequestRepository.findById(id)
                .map(r -> ResponseEntity.ok(toDto(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    // REMOVED: approve() and reject() methods
    // MovieRequest workflow is now simplified to PENDING → SCHEDULED only
    // Admin assigns movie → creates PENDING MovieRequest
    // Staff creates schedule → status becomes SCHEDULED (done!)
    // No need for manual approve/reject by admin

    /**
     * Delete a movie request
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return movieRequestRepository.findById(id)
                .map(r -> {
                    movieRequestRepository.delete(r);
                    return ResponseEntity.ok(Map.of("success", true));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toDto(MovieRequest r) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", r.getId());
        dto.put("movieCode", r.getMovieCode());
        
        if (r.getMovie() != null) {
            dto.put("movieId", r.getMovie().getId());
            dto.put("movieTitle", r.getMovie().getTitle());
            dto.put("moviePosterUrl", r.getMovie().getPosterUrl());
            dto.put("movieDuration", r.getMovie().getDuration());
        }
        
        if (r.getTheater() != null) {
            dto.put("theaterId", r.getTheater().getId());
            dto.put("theaterName", r.getTheater().getName());
            dto.put("theaterCode", r.getTheater().getCode());
        }
        
        dto.put("status", r.getStatus());
        dto.put("priority", r.getPriority());
        dto.put("demandScore", r.getDemandScore());
        dto.put("createdBy", r.getCreatedBy());
        dto.put("createdAt", r.getCreatedAt());
        dto.put("updatedAt", r.getUpdatedAt());
        
        return dto;
    }
}
