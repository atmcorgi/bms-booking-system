package fsa.training.service.profile;

import fsa.training.dto.profile.*;
import fsa.training.entity.Account;
import fsa.training.entity.AccountPermission;
import fsa.training.entity.Theater;
import fsa.training.repository.auth.AccountRepository;
import fsa.training.repository.theater.TheaterRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final AccountRepository accountRepository;
    private final TheaterRepository theaterRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(AccountRepository accountRepository, 
                         TheaterRepository theaterRepository,
                         PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.theaterRepository = theaterRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public ProfileDto getProfile(String username) {
        Account account = accountRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return mapToProfileDto(account);
    }

    @Transactional
    public ProfileDto updateProfile(String username, UpdateProfileDto dto) {
        Account account = accountRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Update fields
        if (dto.getFullName() != null) {
            account.setFullName(dto.getFullName());
        }
        if (dto.getEmail() != null) {
            // Check if email is already taken by another account
            accountRepository.findByEmail(dto.getEmail()).ifPresent(existingAccount -> {
                if (!existingAccount.getId().equals(account.getId())) {
                    throw new RuntimeException("Email already in use");
                }
            });
            account.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            account.setPhone(dto.getPhone());
        }

        Account savedAccount = accountRepository.save(account);
        return mapToProfileDto(savedAccount);
    }

    @Transactional
    public void updateAvatar(String username, String avatarUrl) {
        Account account = accountRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        account.setAvatar(avatarUrl);
        accountRepository.save(account);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordDto dto) {
        Account account = accountRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Validate current password
        if (!passwordEncoder.matches(dto.getCurrentPassword(), account.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password matches confirm password
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        // Update password
        account.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        accountRepository.save(account);
    }

    private ProfileDto mapToProfileDto(Account account) {
        ProfileDto dto = ProfileDto.builder()
                .id(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phone(account.getPhone())
                .avatar(account.getAvatar())
                .emailVerified(account.getEmailVerified())
                .authProvider(account.getAuthProvider() != null ? account.getAuthProvider().name() : null)
                .build();

        // Extract roles
        if (account.getAccountPermissions() != null) {
            List<String> roles = account.getAccountPermissions().stream()
                    .map(ap -> ap.getRole().getRoleName())
                    .collect(Collectors.toList());
            dto.setRoles(roles);

            // Get assigned theater for staff
            account.getAccountPermissions().stream()
                    .filter(ap -> ap.getAssignedTheaterId() != null)
                    .findFirst()
                    .ifPresent(ap -> {
                        dto.setAssignedTheaterId(ap.getAssignedTheaterId());
                        theaterRepository.findById(ap.getAssignedTheaterId())
                                .ifPresent(theater -> dto.setAssignedTheaterName(theater.getName()));
                    });
        }

        return dto;
    }
}
