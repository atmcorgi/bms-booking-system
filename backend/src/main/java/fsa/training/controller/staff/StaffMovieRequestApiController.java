package fsa.training.controller.staff;

import fsa.training.entity.MovieRequest;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.security.TheaterPermissionEvaluator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/movie-requests")
public class StaffMovieRequestApiController {

    private final MovieRequestRepository movieRequestRepository;
    private final TheaterPermissionEvaluator permissionEvaluator;

    public StaffMovieRequestApiController(
            MovieRequestRepository movieRequestRepository,
            TheaterPermissionEvaluator permissionEvaluator) {
        this.movieRequestRepository = movieRequestRepository;
        this.permissionEvaluator = permissionEvaluator;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String status,
            Authentication auth) {

        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        List<MovieRequest> requests;
        if (status != null && !status.isBlank()) {
            requests = movieRequestRepository.findByTheaterIdAndStatus(theaterId, status);
        } else {
            requests = movieRequestRepository.findByTheaterId(theaterId);
        }

        List<Map<String, Object>> items = requests.stream()
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", r.getId());
                    m.put("status", r.getStatus());
                    m.put("priority", r.getPriority());
                    m.put("demandScore", r.getDemandScore());
                    m.put("createdAt", r.getCreatedAt());
                    if (r.getMovie() != null) {
                        m.put("movieId", r.getMovie().getId());
                        m.put("movieCode", r.getMovie().getCode());
                        m.put("movieTitle", r.getMovie().getTitle());
                    }
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("total", items.size());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        MovieRequest request = movieRequestRepository.findById(id)
                .orElse(null);

        if (request == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        }

        // Verify staff can only update requests for their assigned theater
        if (!request.getTheater().getId().equals(theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot update request for different theater"));
        }

        // Update priority and demandScore
        if (body.containsKey("priority")) {
            Object p = body.get("priority");
            request.setPriority(p != null ? ((Number) p).intValue() : 0);
        }

        if (body.containsKey("demandScore")) {
            Object d = body.get("demandScore");
            request.setDemandScore(d != null ? ((Number) d).doubleValue() : 0.0);
        }

        movieRequestRepository.save(request);

        Map<String, Object> response = new HashMap<>();
        response.put("id", request.getId());
        response.put("priority", request.getPriority());
        response.put("demandScore", request.getDemandScore());
        response.put("message", "Updated successfully");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            Authentication auth) {

        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        MovieRequest request = movieRequestRepository.findById(id)
                .orElse(null);

        if (request == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        }

        // Verify staff can only delete requests for their assigned theater
        if (!request.getTheater().getId().equals(theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot delete request for different theater"));
        }

        movieRequestRepository.delete(request);

        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @PostMapping("/{id}/publish")
    @Transactional
    public ResponseEntity<?> publish(
            @PathVariable Long id,
            Authentication auth) {

        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        MovieRequest request = movieRequestRepository.findById(id)
                .orElse(null);

        if (request == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        }

        // Verify staff can only publish requests for their assigned theater
        if (!request.getTheater().getId().equals(theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot publish request for different theater"));
        }

        // Only SCHEDULED requests can be published
        if (!"SCHEDULED".equals(request.getStatus())) {
            return ResponseEntity.status(400).body(Map.of("error", "Only SCHEDULED requests can be published"));
        }

        request.setStatus("PUBLISHED");
        movieRequestRepository.save(request);

        return ResponseEntity.ok(Map.of("message", "Published successfully", "status", "PUBLISHED"));
    }

    @PostMapping("/{id}/unpublish")
    @Transactional
    public ResponseEntity<?> unpublish(
            @PathVariable Long id,
            Authentication auth) {

        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        MovieRequest request = movieRequestRepository.findById(id)
                .orElse(null);

        if (request == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        }

        // Verify staff can only unpublish requests for their assigned theater
        if (!request.getTheater().getId().equals(theaterId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot unpublish request for different theater"));
        }

        // Only PUBLISHED requests can be unpublished
        if (!"PUBLISHED".equals(request.getStatus())) {
            return ResponseEntity.status(400).body(Map.of("error", "Only PUBLISHED requests can be unpublished"));
        }

        request.setStatus("SCHEDULED");
        movieRequestRepository.save(request);

        return ResponseEntity.ok(Map.of("message", "Unpublished successfully", "status", "SCHEDULED"));
    }
}
