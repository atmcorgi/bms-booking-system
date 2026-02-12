package fsa.training.config;

import fsa.training.entity.*;
import fsa.training.repository.*;
import fsa.training.repository.auth.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            AccountRepository accountRepository,
            RoleRepository roleRepository,
            AccountPermissionRepository accountPermissionRepository,
            PasswordEncoder passwordEncoder) {
        
        return args -> {
            // Check if roles already exist
            if (roleRepository.count() > 0) {
                // Check if deprecated "USER" role exists
                roleRepository.findByRoleName("USER").ifPresent(userRole -> {
                     System.out.println("Found deprecated role 'USER'. Checking for 'CUSTOMER' role...");
                     
                     fsa.training.entity.Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                        .orElseGet(() -> {
                            fsa.training.entity.Role newRole = new fsa.training.entity.Role();
                            newRole.setRoleName("CUSTOMER");
                            return roleRepository.save(newRole);
                        });
                     
                     // Helper variable for effective finality in lambda
                     fsa.training.entity.Role finalCustomerRole = customerRole;

                     System.out.println("Migrating permissions from 'USER' to 'CUSTOMER'...");
                     List<AccountPermission> userPermissions = accountPermissionRepository.findByRole(userRole);
                     
                     for (AccountPermission perm : userPermissions) {
                         // Check if this account already has CUSTOMER role
                         boolean alreadyHasCustomer = accountPermissionRepository
                             .findFirstByAccount_IdAndRole_RoleName(perm.getAccount().getId(), "CUSTOMER")
                             .isPresent();
                         
                         if (alreadyHasCustomer) {
                             // Duplicate permission, just delete the old USER one
                             accountPermissionRepository.delete(perm);
                         } else {
                             // Migrate permission to CUSTOMER role
                             perm.setRole(finalCustomerRole);
                             accountPermissionRepository.save(perm);
                         }
                     }
                     
                     // Now it's safe to delete the USER role
                     System.out.println("Deleting deprecated 'USER' role...");
                     roleRepository.delete(userRole);
                });
                
                System.out.println("Database checks completed.");
                return;
            }

            System.out.println("Initializing database with default data...");

            // Create roles
            Role adminRole = new Role();
            adminRole.setRoleName("ADMIN");
            adminRole = roleRepository.save(adminRole);

            Role staffRole = new Role();
            staffRole.setRoleName("STAFF");
            staffRole = roleRepository.save(staffRole);

            Role customerRole = new Role();
            customerRole.setRoleName("CUSTOMER");
            customerRole = roleRepository.save(customerRole);

            // Create admin account
            Account admin = new Account();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@cgv.com");
            admin.setFullName("System Administrator");
            admin.setEnabled(true);
            admin.setEmailVerified(true);
            admin.setAuthProvider(AuthProvider.LOCAL);
            admin.setAccountPermissions(new HashSet<>());
            admin = accountRepository.save(admin);

            AccountPermission adminPermission = new AccountPermission();
            adminPermission.setAccount(admin);
            adminPermission.setRole(adminRole);
            accountPermissionRepository.save(adminPermission);

            // Create staff account
            Account staff = new Account();
            staff.setUsername("staff");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setEmail("staff@cgv.com");
            staff.setFullName("Staff User");
            staff.setEnabled(true);
            staff.setEmailVerified(true);
            staff.setAuthProvider(AuthProvider.LOCAL);
            staff.setAccountPermissions(new HashSet<>());
            staff = accountRepository.save(staff);

            AccountPermission staffPermission = new AccountPermission();
            staffPermission.setAccount(staff);
            staffPermission.setRole(staffRole);
            accountPermissionRepository.save(staffPermission);

            // Create customer account
            Account customer = new Account();
            customer.setUsername("customer");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setEmail("customer@example.com");
            customer.setFullName("Test Customer");
            customer.setEnabled(true);
            customer.setEmailVerified(true);
            customer.setAuthProvider(AuthProvider.LOCAL);
            customer.setAccountPermissions(new HashSet<>());
            customer = accountRepository.save(customer);

            AccountPermission customerPermission = new AccountPermission();
            customerPermission.setAccount(customer);
            customerPermission.setRole(customerRole);
            accountPermissionRepository.save(customerPermission);

            System.out.println("✓ Database initialized successfully!");
            System.out.println("✓ Admin: admin/admin123");
            System.out.println("✓ Staff: staff/staff123");
            System.out.println("✓ Customer: customer/customer123");
        };
    }
}
