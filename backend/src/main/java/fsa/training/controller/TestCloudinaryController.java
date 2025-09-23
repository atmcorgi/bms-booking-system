package fsa.training.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test/cloudinary")
public class TestCloudinaryController {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Test Cloudinary connection
     */
    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test connection by getting account info
            Map<String, Object> accountInfo = cloudinary.api().ping(ObjectUtils.emptyMap());
            
            response.put("success", true);
            response.put("message", "Cloudinary connection successful");
            response.put("accountInfo", accountInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Cloudinary connection failed: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Test image upload from URL
     */
    @PostMapping("/test-upload")
    public ResponseEntity<Map<String, Object>> testUpload(@RequestParam String imageUrl) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test upload from URL
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "public_id", "test-upload-" + System.currentTimeMillis(),
                    "folder", "test-uploads",
                    "resource_type", "image"
            );

            Map<String, Object> result = cloudinary.uploader().upload(imageUrl, uploadParams);
            String secureUrl = (String) result.get("secure_url");
            
            response.put("success", true);
            response.put("message", "Test upload successful");
            response.put("originalUrl", imageUrl);
            response.put("cloudinaryUrl", secureUrl);
            response.put("publicId", result.get("public_id"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Test upload failed: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Test optimized URL generation
     */
    @GetMapping("/test-optimize")
    public ResponseEntity<Map<String, Object>> testOptimize(@RequestParam String imageUrl) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract public_id from URL
            String publicId = extractPublicId(imageUrl);
            if (publicId == null) {
                response.put("success", false);
                response.put("message", "Invalid Cloudinary URL");
                return ResponseEntity.badRequest().body(response);
            }

            // Generate optimized URL
            String optimizedUrl = cloudinary.url()
                    .transformation(new Transformation()
                            .width(300)
                            .height(450)
                            .crop("fill")
                            .gravity("face")
                            .quality("auto")
                            .fetchFormat("auto"))
                    .generate(publicId);
            
            response.put("success", true);
            response.put("message", "URL optimization successful");
            response.put("originalUrl", imageUrl);
            response.put("optimizedUrl", optimizedUrl);
            response.put("publicId", publicId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "URL optimization failed: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private String extractPublicId(String url) {
        try {
            // Extract public_id from Cloudinary URL
            String[] parts = url.split("/");
            if (parts.length >= 2) {
                String lastPart = parts[parts.length - 1];
                // Remove file extension
                return lastPart.substring(0, lastPart.lastIndexOf('.'));
            }
        } catch (Exception e) {
            // Ignore
        }
        return null;
    }
}
