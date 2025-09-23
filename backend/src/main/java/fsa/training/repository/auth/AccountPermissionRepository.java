package fsa.training.repository.auth;

import fsa.training.entity.AccountPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountPermissionRepository extends JpaRepository<AccountPermission, Long> {
    List<AccountPermission> findByAssignedTheaterId(Long theaterId);
    Optional<AccountPermission> findFirstByAccount_IdAndRole_RoleName(Long accountId, String roleName);
}
