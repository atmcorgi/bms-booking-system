package fsa.training.controller;

import fsa.training.service.ImageMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/images")
public class ImageMigrationController {

    @Autowired
    private ImageMigrationService imageMigrationService;

    /**
     * Get migration statistics
     */
    @GetMapping("/migration-stats")
    public ResponseEntity<Map<String, Object>> getMigrationStats() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            ImageMigrationService.MigrationStats stats = imageMigrationService.getMigrationStats();
            
            response.put("success", true);
            response.put("stats", Map.of(
                "totalMovies", stats.totalMovies,
                "cloudinaryMovies", stats.cloudinaryMovies,
                "externalMovies", stats.externalMovies,
                "noUrlMovies", stats.noUrlMovies,
                "migrationProgress", stats.totalMovies > 0 ? 
                    (double) stats.cloudinaryMovies / stats.totalMovies * 100 : 0
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get migration stats: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Migrate all movie posters
     */
    @PostMapping("/migrate-all")
    public ResponseEntity<Map<String, Object>> migrateAllPosters() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            imageMigrationService.migrateAllMoviePosters();
            
            response.put("success", true);
            response.put("message", "Migration completed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to migrate posters: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Migrate specific movie poster
     */
    @PostMapping("/migrate/{movieId}")
    public ResponseEntity<Map<String, Object>> migrateMoviePoster(@PathVariable Long movieId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean success = imageMigrationService.migrateMoviePoster(movieId);
            
            response.put("success", success);
            response.put("message", success ? "Movie poster migrated successfully" : "No migration needed or failed");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to migrate movie poster: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
