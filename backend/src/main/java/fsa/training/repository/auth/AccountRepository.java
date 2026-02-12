package fsa.training.repository.auth;

import fsa.training.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByUsername(String username);
    Optional<Account> findByEmail(String email);
    Optional<Account> findByUsernameOrEmail(String username, String email);
    Optional<Account> findByGoogleSub(String googleSub);
}