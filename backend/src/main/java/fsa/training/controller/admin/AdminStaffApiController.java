package fsa.training.controller.admin;

import fsa.training.entity.Account;
import fsa.training.entity.AccountPermission;
import fsa.training.repository.auth.AccountPermissionRepository;
import fsa.training.repository.auth.RoleRepository;
import fsa.training.repository.auth.AccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/staff")
public class AdminStaffApiController {
    private final AccountRepository accountRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final RoleRepository roleRepository;

    public AdminStaffApiController(AccountRepository accountRepository,
                                   AccountPermissionRepository accountPermissionRepository,
                                   RoleRepository roleRepository) {
        this.accountRepository = accountRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public List<Map<String, Object>> listAll(@RequestParam(value = "q", required = false) String q,
                                             @RequestParam(value = "role", required = false) String role,
                                             @RequestParam(value = "unassignedForTheaterId", required = false) Long unassignedForTheaterId) {
        return accountRepository.findAll().stream()
                .filter(a -> q == null || q.isBlank() || a.getUsername().toLowerCase().contains(q.toLowerCase()))
                .filter(a -> {
                    if (role == null || role.isBlank()) return true;
                    return a.getAccountPermissions() != null && a.getAccountPermissions().stream()
                            .anyMatch(ap -> ap.getRole() != null && role.equals(ap.getRole().getRoleName()));
                })
                .filter(a -> {
                    if (unassignedForTheaterId == null) return true;
                    boolean hasRole = a.getAccountPermissions() != null && a.getAccountPermissions().stream()
                            .anyMatch(ap -> ap.getRole() != null && (role == null || role.equals(ap.getRole().getRoleName())));
                    if (!hasRole) return false;
                    boolean hasAnyAssigned = a.getAccountPermissions().stream()
                            .anyMatch(ap -> ap.getRole() != null && (role == null || role.equals(ap.getRole().getRoleName()))
                                    && ap.getAssignedTheaterId() != null);
                    return !hasAnyAssigned;
                })
                .map(this::toAccount)
                .collect(Collectors.toList());
    }

    @GetMapping("/theater/{theaterId}")
    public List<Map<String, Object>> listAssigned(@PathVariable Long theaterId) {
        return accountPermissionRepository.findByAssignedTheaterId(theaterId).stream()
                .map(ap -> {
                    Map<String, Object> m = new java.util.HashMap<>(toAccount(ap.getAccount()));
                    m.put("permissionId", ap.getId());
                    String roleName = ap.getRole() != null ? ap.getRole().getRoleName() : null;
                    m.put("role", roleName);
                    return m;
                })
                .collect(Collectors.toList());
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assign(@RequestBody Map<String, Object> body) {
        Long accountId = ((Number) body.get("accountId")).longValue();
        Long theaterId = ((Number) body.get("theaterId")).longValue();
        String roleName = String.valueOf(body.getOrDefault("role", "STAFF"));

        Optional<AccountPermission> existing = accountPermissionRepository
                .findFirstByAccount_IdAndRole_RoleName(accountId, roleName);
        AccountPermission ap = existing.orElseGet(AccountPermission::new);
        Account acc = accountRepository.findById(accountId).orElseThrow();
        ap.setAccount(acc);
        if (ap.getRole() == null || !roleName.equals(ap.getRole().getRoleName())) {
            var role = roleRepository.findByRoleName(roleName)
                    .orElseGet(() -> {
                        fsa.training.entity.Role r = new fsa.training.entity.Role();
                        r.setRoleName(roleName);
                        return roleRepository.save(r);
                    });
            ap.setRole(role);
        }
        ap.setAssignedTheaterId(theaterId);
        accountPermissionRepository.save(ap);
        java.util.Map<String, Object> ok = new java.util.HashMap<>();
        ok.put("success", true);
        return ResponseEntity.ok(ok);
    }

    @PostMapping("/unassign")
    public ResponseEntity<?> unassign(@RequestBody Map<String, Object> body) {
        Object pid = body.get("permissionId");
        if (pid != null) {
            Long permissionId = ((Number) pid).longValue();
            return accountPermissionRepository.findById(permissionId)
                    .map(ap -> {
                        ap.setAssignedTheaterId(null);
                        accountPermissionRepository.save(ap);
                        java.util.Map<String, Object> ok = new java.util.HashMap<>();
                        ok.put("success", true);
                        return ResponseEntity.ok(ok);
                    })
                    .orElseGet(() -> {
                        java.util.Map<String, Object> err = new java.util.HashMap<>();
                        err.put("error", "Permission not found");
                        return ResponseEntity.badRequest().body(err);
                    });
        }
        Object accId = body.get("accountId");
        String roleName = String.valueOf(body.getOrDefault("role", "STAFF"));
        if (accId != null) {
            Long accountId = ((Number) accId).longValue();
            return accountPermissionRepository.findFirstByAccount_IdAndRole_RoleName(accountId, roleName)
                    .map(ap -> {
                        ap.setAssignedTheaterId(null);
                        accountPermissionRepository.save(ap);
                        java.util.Map<String, Object> ok = new java.util.HashMap<>();
                        ok.put("success", true);
                        return ResponseEntity.ok(ok);
                    })
                    .orElseGet(() -> {
                        java.util.Map<String, Object> err = new java.util.HashMap<>();
                        err.put("error", "Permission not found for account");
                        return ResponseEntity.badRequest().body(err);
                    });
        }
        java.util.Map<String, Object> err = new java.util.HashMap<>();
        err.put("error", "Missing permissionId or accountId");
        return ResponseEntity.badRequest().body(err);
    }

    private Map<String, Object> toAccount(Account a) {
        return Map.of(
                "id", a.getId(),
                "username", a.getUsername(),
                "enabled", a.isEnabled()
        );
    }
}


