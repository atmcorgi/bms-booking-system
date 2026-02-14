package fsa.training.controller.report;

import fsa.training.service.report.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Autowired
    private fsa.training.repository.auth.AccountRepository accountRepository;

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long theaterId = getTheaterIdForCurrentUser();
        return ResponseEntity.ok(statisticsService.getRevenueStats(from, to, theaterId));
    }

    @GetMapping("/top-movies")
    public ResponseEntity<?> getTopMovies(@RequestParam(defaultValue = "5") int limit) {
        Long theaterId = getTheaterIdForCurrentUser();
        return ResponseEntity.ok(statisticsService.getTopMovies(limit, theaterId));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        Long theaterId = getTheaterIdForCurrentUser();
        return ResponseEntity.ok(statisticsService.getSummary(theaterId));
    }

    private Long getTheaterIdForCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            String username = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            fsa.training.entity.Account account = accountRepository.findByUsername(username).orElse(null);
            
            if (account != null && account.getAccountPermissions() != null) {
                // If ADMIN, return null (Global view)
                // If STAFF, return assignedTheaterId
                // Logic: Check if any filtering is needed. 
                // For now, let's assume if they have STAFF role and NOT ADMIN, we filter.
                
                boolean isAdmin = account.getAccountPermissions().stream()
                        .anyMatch(ap -> "ADMIN".equalsIgnoreCase(ap.getRole().getRoleName()));
                
                if (isAdmin) return null;
                
                // If not admin, check for STAFF role and get theater
                return account.getAccountPermissions().stream()
                        .filter(ap -> "STAFF".equalsIgnoreCase(ap.getRole().getRoleName()))
                        .map(fsa.training.entity.AccountPermission::getAssignedTheaterId)
                        .filter(java.util.Objects::nonNull)
                        .findFirst()
                        .orElse(null);
            }
        }
        return null;
    }
}
