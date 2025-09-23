package fsa.training.security;

import fsa.training.repository.auth.AccountRepository;
import fsa.training.entity.Account;
import fsa.training.entity.AccountPermission;
import org.springframework.stereotype.Component;

/**
 * Permission evaluator for theater-specific access control
 */
@Component("theaterPermissionEvaluator")
public class TheaterPermissionEvaluator {
    
    private final AccountRepository accountRepository;
    
    public TheaterPermissionEvaluator(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }
    
    /**
     * Check if user can manage a specific theater
     * @param username the username
     * @param theaterId the theater ID
     * @return true if user can manage the theater
     */
    public boolean canManageTheater(String username, Long theaterId) {
        return accountRepository.findByUsername(username)
                .map(account -> {
                    // Check if user has ADMIN role (can manage all theaters)
                    if (hasRole(account, "ADMIN")) {
                        return true; // Admin can manage all theaters
                    }
                    
                    // Check if user has STAFF role and is assigned to this theater
                    if (hasRole(account, "STAFF")) {
                        return theaterId != null && isAssignedToTheater(account, theaterId);
                    }
                    
                    return false;
                })
                .orElse(false);
    }
    
    /**
     * Check if user is admin
     * @param username the username
     * @return true if user is admin
     */
    public boolean isAdmin(String username) {
        return accountRepository.findByUsername(username)
                .map(account -> hasRole(account, "ADMIN"))
                .orElse(false);
    }
    
    /**
     * Check if user is staff
     * @param username the username
     * @return true if user is staff
     */
    public boolean isStaff(String username) {
        return accountRepository.findByUsername(username)
                .map(account -> hasRole(account, "STAFF"))
                .orElse(false);
    }
    
    /**
     * Get assigned theater ID for staff user
     * @param username the username
     * @return theater ID or null
     */
    public Long getAssignedTheaterId(String username) {
        return accountRepository.findByUsername(username)
                .map(account -> account.getAccountPermissions() == null ? null : account.getAccountPermissions().stream()
                        .filter(java.util.Objects::nonNull)
                        .filter(ap -> ap.getRole() != null && "STAFF".equals(ap.getRole().getRoleName()))
                        .map(AccountPermission::getAssignedTheaterId)
                        .filter(java.util.Objects::nonNull)
                        .findFirst()
                        .orElse(null))
                .orElse(null);
    }
    
    private boolean hasRole(Account account, String roleName) {
        return account.getAccountPermissions().stream()
                .map(AccountPermission::getRole)
                .anyMatch(role -> roleName.equals(role.getRoleName()));
    }
    
    private boolean isAssignedToTheater(Account account, Long theaterId) {
        return account.getAccountPermissions().stream()
                .filter(ap -> "STAFF".equals(ap.getRole().getRoleName()))
                .anyMatch(ap -> theaterId.equals(ap.getAssignedTheaterId()));
    }
}
