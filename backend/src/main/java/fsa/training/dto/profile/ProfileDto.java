package fsa.training.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatar;
    private Boolean emailVerified;
    private String authProvider;
    private List<String> roles;
    
    // Role-specific fields
    private Long assignedTheaterId;
    private String assignedTheaterName;
}
