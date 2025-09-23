package fsa.training.observer;

import fsa.training.repository.auth.AccountRepository;
import fsa.training.entity.Account;
import fsa.training.entity.AccountPermission;
import fsa.training.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class StaffNotificationObserver implements Subscriber {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffNotificationObserver.class);
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Override
    public void update(Publisher publisher, Object arg) {
        if (publisher instanceof MovieAssignmentSubject && arg instanceof MovieAssignmentState) {
            MovieAssignmentState state = (MovieAssignmentState) arg;
            handleMovieAssignment(state);
        }
    }
    
    private void handleMovieAssignment(MovieAssignmentState state) {
        // Tìm staff của theater được assign
        List<String> staffUsernames = getStaffForTheater(state.getTheaterId());
        
        if (staffUsernames.isEmpty()) {
            logger.warn("Không tìm thấy staff nào cho theater ID: {}", state.getTheaterId());
            return;
        }
        
        // Gửi thông báo cho tất cả staff BẤT ĐỒNG BỘ (concurrent) - sử dụng method mới
        notificationService.createMovieAssignmentNotificationsForMultipleStaff(
                state.getMovieTitle(),
                state.getTheaterName(),
                state.getAssignedBy(),
                staffUsernames,
                state.getMovieId(),
                state.getTheaterId()
        ).thenAccept(notifications -> {
            logger.info("✅ Đã gửi notification cho {} staff của rạp {} thành công!", notifications.size(), state.getTheaterName());
        }).exceptionally(throwable -> {
            logger.error("❌ Lỗi khi gửi notification cho staff của rạp {}: {}", state.getTheaterName(), throwable.getMessage(), throwable);
            return null;
        });
    }
    
    private List<String> getStaffForTheater(Long theaterId) {
        Set<String> staffUsernames = new HashSet<>(); // Sử dụng Set để tránh duplicate
        
        try {
            List<Account> allAccounts = accountRepository.findAll();
            for (Account account : allAccounts) {
                if (account.getAccountPermissions() != null) {
                    for (AccountPermission permission : account.getAccountPermissions()) {
                        if (permission.getRole() != null && 
                            "STAFF".equals(permission.getRole().getRoleName()) &&
                            theaterId.equals(permission.getAssignedTheaterId())) {
                            staffUsernames.add(account.getUsername()); // Set tự động loại bỏ duplicate
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error getting staff for theater: {}", e.getMessage(), e);
        }
        
        logger.debug("🔍 Tìm thấy {} staff cho theater {}: {}", staffUsernames.size(), theaterId, staffUsernames);
        return new ArrayList<>(staffUsernames);
    }
    
}
