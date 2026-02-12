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
    public ResponseEntity<Map<String, Object>> uploadPoster(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "movieTitle", required = false) String movieTitle) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            // If movieTitle is not provided, use a default prefix for banners
            String resourceTitle = movieTitle != null && !movieTitle.isEmpty() ? movieTitle : "banner";

            String imageUrl = imageUploadService.uploadPoster(file, resourceTitle);

            response.put("success", true);
            response.put("url", imageUrl);
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
            @RequestParam(value = "movieTitle", required = false) String movieTitle) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            String videoUrl = imageUploadService.uploadTrailer(file, movieTitle);

            response.put("success", true);
            response.put("url", videoUrl);
            response.put("message", "Trailer uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to upload trailer: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

}
