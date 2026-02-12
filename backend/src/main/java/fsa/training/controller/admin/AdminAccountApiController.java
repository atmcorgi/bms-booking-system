package fsa.training.controller.admin;

import fsa.training.entity.Account;
import fsa.training.entity.AccountPermission;
import fsa.training.entity.Role;
import fsa.training.repository.auth.AccountPermissionRepository;
import fsa.training.repository.auth.AccountRepository;
import fsa.training.repository.auth.RoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/accounts")
public class AdminAccountApiController {
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PersistenceContext
    private EntityManager entityManager;

    public AdminAccountApiController(AccountRepository accountRepository,
                                    RoleRepository roleRepository,
                                    AccountPermissionRepository accountPermissionRepository,
                                    PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listAll(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "enabled", required = false) Boolean enabled,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        // Get ALL accounts first, then filter
        List<Account> allAccounts = accountRepository.findAll(Sort.by("id").descending());
        
        // Apply filters
        List<Account> filteredAccounts = allAccounts.stream()
                .filter(a -> q == null || q.isBlank() || 
                        a.getUsername().toLowerCase().contains(q.toLowerCase()) ||
                        (a.getEmail() != null && a.getEmail().toLowerCase().contains(q.toLowerCase())) ||
                        (a.getFullName() != null && a.getFullName().toLowerCase().contains(q.toLowerCase())))
                .filter(a -> {
                    if (role == null || role.isBlank()) return true;
                    return a.getAccountPermissions() != null && a.getAccountPermissions().stream()
                            .anyMatch(ap -> ap.getRole() != null && role.equals(ap.getRole().getRoleName()));
                })
                .filter(a -> enabled == null || a.isEnabled() == enabled)
                .collect(Collectors.toList());
        
        // Calculate pagination
        int totalItems = filteredAccounts.size();
        int totalPages = (int) Math.ceil((double) totalItems / size);
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalItems);
        
        // Get page items
        List<Map<String, Object>> pageItems = filteredAccounts.stream()
                .skip(fromIndex)
                .limit(size)
                .map(this::toAccountDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("items", pageItems);
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalItems", totalItems);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return accountRepository.findById(id)
                .map(account -> ResponseEntity.ok(toAccountDto(account)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            String username = (String) body.get("username");
            String email = (String) body.get("email");
            String password = (String) body.get("password");
            String fullName = (String) body.get("fullName");
            String phone = (String) body.get("phone");

            // Validate required fields
            if (username == null || username.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
            }
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }
            if (password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
            }
            if (fullName == null || fullName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Full name is required"));
            }

            // Check if username already exists
            if (accountRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
            }

            // Check if email already exists
            if (accountRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            }

            Account account = new Account();
            account.setUsername(username);
            account.setEmail(email);
            account.setPassword(passwordEncoder.encode(password));
            account.setFullName(fullName);
            account.setPhone(phone);
            account.setEnabled(true);
            account.setEmailVerified(true);

            Account savedAccount = accountRepository.save(account);

            // Handle roles
            @SuppressWarnings("unchecked")
            List<Number> roleIds = (List<Number>) body.get("roleIds");
            if (roleIds != null && !roleIds.isEmpty()) {
                for (Number roleId : roleIds) {
                    roleRepository.findById(roleId.longValue()).ifPresent(role -> {
                        AccountPermission permission = new AccountPermission();
                        permission.setAccount(savedAccount);
                        permission.setRole(role);
                        accountPermissionRepository.save(permission);
                    });
                }
            }

            return ResponseEntity.ok(toAccountDto(accountRepository.findById(savedAccount.getId()).get()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating account: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        // Debug: Print all roles in DB to see what exists
        List<fsa.training.entity.Role> allRoles = roleRepository.findAll();
        Set<Long> validRoleIds = allRoles.stream().map(fsa.training.entity.Role::getId).collect(Collectors.toSet());
        System.out.println("DEBUG: Available Role IDs: " + validRoleIds);
        
            Optional<Account> optAccount = accountRepository.findById(id);
            if (optAccount.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Account account = optAccount.get();

            // Update fields
            if (body.containsKey("username")) {
                String username = (String) body.get("username");
                if (username != null && !username.equals(account.getUsername())) {
                    // Check if new username already exists
                    if (accountRepository.findByUsername(username).isPresent()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
                    }
                    account.setUsername(username);
                }
            }

            if (body.containsKey("email")) {
                String email = (String) body.get("email");
                if (email != null && !email.equals(account.getEmail())) {
                    // Check if new email already exists
                    if (accountRepository.findByEmail(email).isPresent()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
                    }
                    account.setEmail(email);
                }
            }

            if (body.containsKey("fullName")) {
                account.setFullName((String) body.get("fullName"));
            }

            if (body.containsKey("phone")) {
                account.setPhone((String) body.get("phone"));
            }

            if (body.containsKey("enabled")) {
                account.setEnabled((Boolean) body.get("enabled"));
            }

            accountRepository.save(account);

            // Handle roles update
            if (body.containsKey("roleIds")) {
                @SuppressWarnings("unchecked")
                List<Number> roleIds = (List<Number>) body.get("roleIds");
                
                // Get the list of role IDs that should be kept
                Set<Long> newRoleIds = roleIds != null 
                    ? roleIds.stream()
                        .map(Number::longValue)
                        .filter(validRoleIds::contains) // Filter out invalid role IDs
                        .collect(Collectors.toSet())
                    : new HashSet<>();
                
                // Step 1: Delete permissions for roles that are NOT in the new selection
                // This includes BOTH general permissions AND theater assignments
                if (account.getAccountPermissions() != null) {
                    List<AccountPermission> toDelete = account.getAccountPermissions().stream()
                            .filter(ap -> ap.getRole() != null && !newRoleIds.contains(ap.getRole().getId()))
                            .collect(Collectors.toList());
                    
                    // Remove from collection - cascade will handle database deletion
                    account.getAccountPermissions().removeAll(toDelete);
                    accountRepository.save(account); // Save to trigger cascade delete
                }

                // Step 2: Add new general permissions (without theater assignment)
                // Only add if they don't already exist
                if (!newRoleIds.isEmpty()) {
                    // Refresh account to get updated permissions
                    Account refreshedAccount = accountRepository.findById(id).orElseThrow();
                    
                    for (Long finalRoleId : newRoleIds) {
                        
                        // Check if a general permission (assignedTheaterId = null) already exists
                        boolean hasGeneralPermission = refreshedAccount.getAccountPermissions() != null &&
                                refreshedAccount.getAccountPermissions().stream()
                                .anyMatch(ap -> ap.getRole() != null && 
                                        ap.getRole().getId().equals(finalRoleId) &&
                                        ap.getAssignedTheaterId() == null);
                        
                        if (!hasGeneralPermission) {
                            roleRepository.findById(finalRoleId).ifPresent(role -> {
                                AccountPermission permission = new AccountPermission();
                                permission.setAccount(refreshedAccount);
                                permission.setRole(role);
                                permission.setAssignedTheaterId(null);
                                accountPermissionRepository.save(permission);
                            });
                        }
                    }
                }
            }

            // Clear the persistence context to force a fresh query
            entityManager.flush();
            entityManager.clear();
            
            // Clear the persistence context to force a fresh query
            entityManager.flush();
            entityManager.clear();
            
            // Refresh account from database to get updated permissions
            Account finalAccount = accountRepository.findById(id).orElseThrow();
            
            return ResponseEntity.ok(toAccountDto(finalAccount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            Optional<Account> optAccount = accountRepository.findById(id);
            if (optAccount.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Account account = optAccount.get();
            
            // Delete all permissions first
            if (account.getAccountPermissions() != null) {
                accountPermissionRepository.deleteAll(account.getAccountPermissions());
            }

            accountRepository.delete(account);
            return ResponseEntity.ok(Map.of("success", true, "message", "Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error deleting account: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle-enabled")
    public ResponseEntity<?> toggleEnabled(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Optional<Account> optAccount = accountRepository.findById(id);
            if (optAccount.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Account account = optAccount.get();
            Boolean enabled = (Boolean) body.get("enabled");
            account.setEnabled(enabled != null ? enabled : !account.isEnabled());
            accountRepository.save(account);

            return ResponseEntity.ok(toAccountDto(account));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error toggling account status: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Optional<Account> optAccount = accountRepository.findById(id);
            if (optAccount.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String newPassword = (String) body.get("newPassword");
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
            }

            Account account = optAccount.get();
            account.setPassword(passwordEncoder.encode(newPassword));
            accountRepository.save(account);

            return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error changing password: " + e.getMessage()));
        }
    }

    private Map<String, Object> toAccountDto(Account account) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", account.getId());
        dto.put("username", account.getUsername());
        dto.put("email", account.getEmail());
        dto.put("fullName", account.getFullName());
        dto.put("phone", account.getPhone());
        dto.put("avatar", account.getAvatar());
        dto.put("enabled", account.isEnabled());
        dto.put("emailVerified", account.getEmailVerified());
        
        if (account.getAccountPermissions() != null) {
            // Get UNIQUE roles only (avoid duplicates from theater assignments)
            List<Map<String, Object>> roles = account.getAccountPermissions().stream()
                    .filter(ap -> ap.getRole() != null)
                    .map(ap -> ap.getRole())
                    .distinct() // Remove duplicate Role objects
                    .map(role -> {
                        Map<String, Object> roleDto = new HashMap<>();
                        roleDto.put("id", role.getId());
                        roleDto.put("roleName", role.getRoleName());
                        return roleDto;
                    })
                    .collect(Collectors.toList());
            dto.put("roles", roles);
        }
        
        return dto;
    }
}

