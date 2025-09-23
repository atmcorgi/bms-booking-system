package fsa.training.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageUploadService {

    private static final Logger logger = LoggerFactory.getLogger(ImageUploadService.class);

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Upload image to Cloudinary with movie poster optimizations
     */
    public String uploadMoviePoster(MultipartFile file, String movieTitle) {
        try {
            // Generate unique public ID
            String publicId = "movie-posters/" + generatePublicId(movieTitle);
            
            // Upload with movie poster specific transformations
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", "movie-posters",
                    "resource_type", "image",
                    "transformation", new Transformation()
                            .width(600)
                            .height(900)
                            .crop("fill")
                            .gravity("face")
                            .quality("auto")
                            .fetchFormat("auto")
            );

            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String secureUrl = (String) result.get("secure_url");
            
            logger.info("Successfully uploaded movie poster: {} -> {}", movieTitle, secureUrl);
            return secureUrl;
            
        } catch (IOException e) {
            logger.error("Failed to upload movie poster for: {}", movieTitle, e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    /**
     * Upload image from URL (for migration from Google Drive)
     */
    public String uploadFromUrl(String imageUrl, String movieTitle) {
        try {
            String publicId = "movie-posters/" + generatePublicId(movieTitle);
            
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", "movie-posters",
                    "resource_type", "image",
                    "transformation", new Transformation()
                            .width(600)
                            .height(900)
                            .crop("fill")
                            .gravity("face")
                            .quality("auto")
                            .fetchFormat("auto")
            );

            Map<String, Object> result = cloudinary.uploader().upload(imageUrl, uploadParams);
            String secureUrl = (String) result.get("secure_url");
            
            logger.info("Successfully migrated image: {} -> {}", movieTitle, secureUrl);
            return secureUrl;
            
        } catch (Exception e) {
            logger.error("Failed to migrate image for: {} from URL: {}", movieTitle, imageUrl, e);
            return imageUrl; // Return original URL if migration fails
        }
    }

    /**
     * Upload video trailer, return secure URL
     */
    public String uploadTrailer(MultipartFile file, String movieTitle) {
        try {
            String publicId = "movie-trailers/" + generatePublicId(movieTitle);

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", "movie-trailers",
                    "resource_type", "video",
                    "eager", new Object[]{
                            ObjectUtils.asMap("format", "mp4", "quality", "auto")
                    }
            );

            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            return (String) result.get("secure_url");
        } catch (IOException e) {
            logger.error("Failed to upload trailer for: {}", movieTitle, e);
            throw new RuntimeException("Failed to upload trailer", e);
        }
    }

    /**
     * Generate optimized image URL with transformations
     */
    public String getOptimizedImageUrl(String originalUrl, int width, int height) {
        if (originalUrl == null || !originalUrl.contains("cloudinary.com")) {
            return originalUrl; // Return original if not Cloudinary URL
        }

        try {
            // Extract public_id from URL
            String publicId = extractPublicId(originalUrl);
            if (publicId == null) {
                return originalUrl;
            }

            // Generate optimized URL using Cloudinary Transformation builder
            return cloudinary.url()
                    .transformation(new Transformation()
                            .width(width)
                            .height(height)
                            .crop("fill")
                            .gravity("face")
                            .quality("auto")
                            .fetchFormat("auto"))
                    .generate(publicId);
                    
        } catch (Exception e) {
            logger.warn("Failed to generate optimized URL for: {}", originalUrl, e);
            return originalUrl;
        }
    }

    /**
     * Delete image from Cloudinary
     */
    public boolean deleteImage(String imageUrl) {
        try {
            String publicId = extractPublicId(imageUrl);
            if (publicId == null) {
                return false;
            }

            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
            
        } catch (Exception e) {
            logger.error("Failed to delete image: {}", imageUrl, e);
            return false;
        }
    }

    private String generatePublicId(String movieTitle) {
        if (movieTitle == null || movieTitle.trim().isEmpty()) {
            return UUID.randomUUID().toString();
        }
        
        // Clean title for public ID
        String cleanedTitle = movieTitle.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
        
        // Ensure we don't exceed bounds
        if (cleanedTitle.length() > 50) {
            cleanedTitle = cleanedTitle.substring(0, 50);
        }
        
        // If cleaned title is empty, use UUID
        if (cleanedTitle.isEmpty()) {
            return UUID.randomUUID().toString();
        }
        
        return cleanedTitle + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String extractPublicId(String url) {
        try {
            // Extract public_id from Cloudinary URL
            // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
            String[] parts = url.split("/");
            if (parts.length >= 2) {
                String lastPart = parts[parts.length - 1];
                // Remove file extension
                return lastPart.substring(0, lastPart.lastIndexOf('.'));
            }
        } catch (Exception e) {
            logger.warn("Failed to extract public_id from URL: {}", url);
        }
        return null;
    }
}
