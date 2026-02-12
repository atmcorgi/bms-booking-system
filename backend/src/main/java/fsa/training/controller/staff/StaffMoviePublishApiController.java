package fsa.training.controller.staff;

import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.security.TheaterPermissionEvaluator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
public class StaffMoviePublishApiController {

    private static final Logger logger = LoggerFactory.getLogger(StaffMoviePublishApiController.class);

    private final MovieRequestRepository movieRequestRepository;
    private final TheaterPermissionEvaluator permissionEvaluator;


    public StaffMoviePublishApiController(MovieRequestRepository movieRequestRepository, TheaterPermissionEvaluator permissionEvaluator) {
        this.movieRequestRepository = movieRequestRepository;
        this.permissionEvaluator = permissionEvaluator;
    }

    @PostMapping("/movies/publish")
    @Transactional
    public ResponseEntity<?> publishMovies(@RequestBody Map<String, List<String>> payload, Authentication auth) {
        Long theaterId = permissionEvaluator.getAssignedTheaterId(auth.getName());
        if (theaterId == null) {
            return ResponseEntity.status(403).body(Map.of("error", "No theater assigned"));
        }

        List<String> movieCodes = payload.get("movieCodes");
        if (movieCodes == null || movieCodes.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "movieCodes list cannot be empty"));
        }

        logger.info("🎬 Publish: Received request to publish movies with codes: {} for theater ID: {}.", movieCodes, theaterId);

        List<String> updatedMovieTitles = movieCodes.stream()
                .map(code -> movieRequestRepository.findFirstByMovie_CodeAndTheater_Id(code, theaterId))
                .filter(requestOpt -> {
                    if (requestOpt.isEmpty()) {
                        return false;
                    }
                    var request = requestOpt.get();
                    logger.info("🎬 Publish: Found MovieRequest for code '{}' with status '{}'.", request.getMovieCode(), request.getStatus());
                    return "SCHEDULED".equals(request.getStatus());
                })
                .map(requestOpt -> {
                    var request = requestOpt.get();
                    request.setStatus("PUBLISHED");
                    movieRequestRepository.save(request);
                    logger.info("✅ Publish: MovieRequest for '{}' status updated to PUBLISHED.", request.getMovieCode());
                    return request.getMovie() != null ? request.getMovie().getTitle() : request.getMovieCode();
                })
                .collect(Collectors.toList());

        if (updatedMovieTitles.isEmpty()) {
            logger.warn("🎬 Publish: No MovieRequests in SCHEDULED state found for the given codes {} and theater ID {}.", movieCodes, theaterId);
            return ResponseEntity.badRequest().body(Map.of("error", "No movies in SCHEDULED state found for the given codes.", "message", "Không có phim nào ở trạng thái SCHEDULED được tìm thấy."));
        }

        String message = String.format("Successfully published %d movies: %s", updatedMovieTitles.size(), String.join(", ", updatedMovieTitles));
        logger.info("✅ Publish: {}.", message);
        return ResponseEntity.ok(Map.of("message", message, "count", updatedMovieTitles.size()));
    }
}
