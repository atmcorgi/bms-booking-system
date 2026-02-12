package fsa.training.controller.profile;

import fsa.training.dto.profile.*;
import fsa.training.service.ImageUploadService;
import fsa.training.service.profile.ProfileService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

    private final ProfileService profileService;
    private final ImageUploadService imageUploadService;

    public ProfileController(ProfileService profileService, ImageUploadService imageUploadService) {
        this.profileService = profileService;
        this.imageUploadService = imageUploadService;
    }

    @GetMapping
    public ResponseEntity<ProfileDto> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ProfileDto profile = profileService.getProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<ProfileDto> updateProfile(@Valid @RequestBody UpdateProfileDto dto) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            ProfileDto updatedProfile = profileService.updateProfile(username, dto);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            logger.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<AvatarUploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AvatarUploadResponse(null, "File is empty"));
            }

            // Validate file size (max 5MB)
            long maxSize = 5 * 1024 * 1024; // 5MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                        .body(new AvatarUploadResponse(null, "File size exceeds 5MB limit"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(new AvatarUploadResponse(null, "File must be an image"));
            }

            // Upload to Cloudinary with "profile" folder
            String avatarUrl = imageUploadService.uploadPoster(file, "profile");
            
            // Update account avatar
            profileService.updateAvatar(username, avatarUrl);

            return ResponseEntity.ok(new AvatarUploadResponse(avatarUrl, "Avatar uploaded successfully"));
            
        } catch (Exception e) {
            logger.error("Error uploading avatar: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new AvatarUploadResponse(null, "Failed to upload avatar: " + e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordDto dto) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            profileService.changePassword(username, dto);
            return ResponseEntity.ok().body(java.util.Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            logger.error("Error changing password: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
