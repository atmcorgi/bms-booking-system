package fsa.training.controller;

import fsa.training.service.ImageUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ImageUploadService imageUploadService;

    /**
     * Upload movie poster
     */
    @PostMapping("/upload-poster")
    public ResponseEntity<Map<String, Object>> uploadMoviePoster(
            @RequestParam("file") MultipartFile file,
            @RequestParam("movieTitle") String movieTitle) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            String imageUrl = imageUploadService.uploadMoviePoster(file, movieTitle);
            
            response.put("success", true);
            response.put("imageUrl", imageUrl);
            response.put("message", "Image uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Upload trailer video
     */
    @PostMapping("/upload-trailer")
    public ResponseEntity<Map<String, Object>> uploadTrailer(
            @RequestParam("file") MultipartFile file,
            @RequestParam("movieTitle") String movieTitle) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            String videoUrl = imageUploadService.uploadTrailer(file, movieTitle);

            response.put("success", true);
            response.put("videoUrl", videoUrl);
            response.put("message", "Trailer uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to upload trailer: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Migrate image from URL to Cloudinary
     */
    @PostMapping("/migrate")
    public ResponseEntity<Map<String, Object>> migrateImage(
            @RequestParam("imageUrl") String imageUrl,
            @RequestParam("movieTitle") String movieTitle) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String newImageUrl = imageUploadService.uploadFromUrl(imageUrl, movieTitle);
            
            response.put("success", true);
            response.put("originalUrl", imageUrl);
            response.put("newImageUrl", newImageUrl);
            response.put("message", "Image migrated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to migrate image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get optimized image URL
     */
    @GetMapping("/optimize")
    public ResponseEntity<Map<String, Object>> getOptimizedImage(
            @RequestParam("imageUrl") String imageUrl,
            @RequestParam(value = "width", defaultValue = "300") int width,
            @RequestParam(value = "height", defaultValue = "450") int height) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String optimizedUrl = imageUploadService.getOptimizedImageUrl(imageUrl, width, height);
            
            response.put("success", true);
            response.put("originalUrl", imageUrl);
            response.put("optimizedUrl", optimizedUrl);
            response.put("width", width);
            response.put("height", height);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to optimize image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Delete image
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean deleted = imageUploadService.deleteImage(imageUrl);
            
            response.put("success", deleted);
            response.put("message", deleted ? "Image deleted successfully" : "Failed to delete image");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
