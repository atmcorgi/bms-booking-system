package fsa.training.service.auth;

import fsa.training.dto.auth.AuthResponse;
import fsa.training.dto.auth.GoogleLoginRequest;
import fsa.training.dto.auth.ForgotPasswordRequest;
import fsa.training.dto.auth.LoginRequest;
import fsa.training.dto.auth.SignupRequest;
import fsa.training.dto.auth.ResetPasswordRequest;
import fsa.training.entity.Account;
import fsa.training.entity.AccountPermission;
import fsa.training.entity.AuthProvider;
import fsa.training.entity.PasswordResetToken;
import fsa.training.entity.Role;
import fsa.training.service.mail.MailService;
import fsa.training.repository.auth.AccountRepository;
import fsa.training.repository.auth.AccountPermissionRepository;
import fsa.training.repository.auth.PasswordResetTokenRepository;
import fsa.training.repository.auth.RoleRepository;
import fsa.training.security.jwt.TokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AuthService {
    
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final String googleClientId;
    private final MailService mailService;
    private final String frontendBaseUrl;
    
    public AuthService(
            AccountRepository accountRepository,
            RoleRepository roleRepository,
            AccountPermissionRepository accountPermissionRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder,
            TokenProvider tokenProvider,
            @Value("${google.client-id}") String googleClientId,
            MailService mailService,
            @Value("${app.frontend.base-url:https://localhost:5173}") String frontendBaseUrl) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.googleClientId = googleClientId;
        this.mailService = mailService;
        this.frontendBaseUrl = frontendBaseUrl;
    }
    
    public AuthResponse login(LoginRequest request) {
        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            
            // Check if account is enabled
            if (!userDetails.isEnabled()) {
                throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
            }
            
            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), userDetails.getPassword())) {
                throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
            }
            
            // Generate token
            String token = tokenProvider.generateToken(Map.of("username", userDetails.getUsername()));
            
            // Get roles
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .toList();
            
            return AuthResponse.builder()
                    .token(token)
                    .username(userDetails.getUsername())
                    .roles(roles)
                    .build();
                    
        } catch (UsernameNotFoundException e) {
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
        }
    }
    
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Validate password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu và xác nhận mật khẩu không khớp");
        }
        
        // Check if username already exists
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
        }
        
        // Check if email already exists
        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }
        
        // Get or create CUSTOMER role
        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName("CUSTOMER");
                    return roleRepository.save(role);
                });
        
        // Create account
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setEnabled(true);
        account.setAccountPermissions(new HashSet<>());
        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        account.setEmailVerified(false);
        account.setAuthProvider(AuthProvider.LOCAL);
        
        Account savedAccount = accountRepository.save(account);
        
        // Create account permission with CUSTOMER role
        AccountPermission permission = new AccountPermission();
        permission.setAccount(savedAccount);
        permission.setRole(customerRole);
        permission.setAssignedTheaterId(null); // Customer không cần theater assignment
        
        accountPermissionRepository.save(permission);
        
        // Generate token for auto-login after signup
        String token = tokenProvider.generateToken(Map.of("username", request.getUsername()));
        
        return AuthResponse.builder()
                .token(token)
                .username(request.getUsername())
                .roles(List.of("CUSTOMER"))
                .message("Đăng ký thành công")
                .build();
    }

    /**
     * Đăng nhập bằng Google ID Token.
     * Flow:
     *  - Frontend lấy idToken từ Google
     *  - Gửi lên đây để verify với Google
     *  - Tìm hoặc tạo Account CUSTOMER tương ứng, sau đó phát JWT nội bộ
     */
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        String idToken = request.getIdToken();
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Thiếu idToken từ Google");
        }

        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> tokenInfo;
        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            tokenInfo = restTemplate.getForObject(url, Map.class);
        } catch (RestClientException e) {
            throw new RuntimeException("Không xác thực được token Google");
        }

        if (tokenInfo == null || tokenInfo.isEmpty()) {
            throw new RuntimeException("Token Google không hợp lệ");
        }

        // Validate audience (client id)
        String aud = (String) tokenInfo.get("aud");
        if (aud == null || !aud.equals(googleClientId)) {
            throw new RuntimeException("Token Google không khớp ứng dụng hiện tại");
        }

        String email = (String) tokenInfo.get("email");
        String sub = (String) tokenInfo.get("sub");
        String name = (String) tokenInfo.get("name");
        Object emailVerifiedObj = tokenInfo.get("email_verified");
        boolean emailVerified = false;
        if (emailVerifiedObj instanceof Boolean b) emailVerified = b;
        else if (emailVerifiedObj instanceof String s) emailVerified = "true".equalsIgnoreCase(s);

        if (sub == null) {
            throw new RuntimeException("Token Google thiếu thông tin định danh người dùng");
        }

        // Prefer email as username if available, otherwise use google_<sub>
        String username = (email != null && !email.isBlank()) ? email : ("google_" + sub);

        // Tìm hoặc tạo account CUSTOMER tương ứng
        Account account = findOrCreateGoogleAccount(username, email, sub, name, emailVerified);

        // Sinh JWT nội bộ
        String token = tokenProvider.generateToken(Map.of("username", account.getUsername()));

        // Lấy danh sách roles
        List<String> roles = account.getAccountPermissions() != null
                ? account.getAccountPermissions().stream()
                .map(ap -> ap.getRole().getRoleName())
                .toList()
                : List.of("CUSTOMER");

        return AuthResponse.builder()
                .token(token)
                .username(account.getUsername())
                .roles(roles)
                .message("Đăng nhập Google thành công")
                .build();
    }

    private Role getOrCreateCustomerRole() {
        return roleRepository.findByRoleName("CUSTOMER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName("CUSTOMER");
                    return roleRepository.save(role);
                });
    }

    private Account findOrCreateGoogleAccount(String username, String email, String sub, String name, boolean emailVerified) {
        // 1) Ưu tiên tìm theo googleSub
        if (sub != null) {
            var bySub = accountRepository.findByGoogleSub(sub);
            if (bySub.isPresent()) return bySub.get();
        }

        // 2) Nếu có email, tìm theo email (hoặc username trùng email)
        Account existingByEmail = null;
        if (email != null && !email.isBlank()) {
            existingByEmail = accountRepository.findByEmail(email).orElse(null);
            if (existingByEmail == null) {
                existingByEmail = accountRepository.findByUsername(email).orElse(null);
            }
        }

        if (existingByEmail != null) {
            // Link Google vào account có sẵn
            existingByEmail.setGoogleSub(sub);
            existingByEmail.setEmail(email != null ? email : existingByEmail.getEmail());
            existingByEmail.setFullName(name != null ? name : existingByEmail.getFullName());
            if (emailVerified) {
                existingByEmail.setEmailVerified(true);
            }
            existingByEmail.setAuthProvider(existingByEmail.getAuthProvider() == null ? AuthProvider.GOOGLE : existingByEmail.getAuthProvider());
            return accountRepository.save(existingByEmail);
        }

        // 3) Không tìm thấy → tạo mới
        Role customerRole = getOrCreateCustomerRole();

        Account acc = new Account();
        acc.setUsername(username);
        acc.setPassword(passwordEncoder.encode("GOOGLE_" + sub));
        acc.setEnabled(true);
        acc.setAccountPermissions(new HashSet<>());
        acc.setEmail(email);
        acc.setEmailVerified(emailVerified);
        acc.setFullName(name);
        acc.setGoogleSub(sub);
        acc.setAuthProvider(AuthProvider.GOOGLE);

        Account saved = accountRepository.save(acc);

        AccountPermission permission = new AccountPermission();
        permission.setAccount(saved);
        permission.setRole(customerRole);
        permission.setAssignedTheaterId(null);
        accountPermissionRepository.save(permission);

        return saved;
    }

    /**
     * Yêu cầu reset password: tạo token và (ở bản này) trả về token để dev dùng thử.
     * Khi triển khai email thực tế, chỉ cần gửi email chứa link reset, không trả token ra response.
     */
    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            return Map.of("message", "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu về email của bạn. Vui lòng kiểm tra email và làm theo hướng dẫn.");
        }

        Account account = accountRepository.findByEmail(email).orElse(null);
        if (account == null) {
            // Không lộ thông tin user
            return Map.of("message", "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu về email của bạn. Vui lòng kiểm tra email và làm theo hướng dẫn.");
        }

        // Tạo token
        String token = java.util.UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .account(account)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();
        passwordResetTokenRepository.save(resetToken);

        // Gửi email reset (nếu cấu hình mail)
        String resetLink = frontendBaseUrl + "/reset-password?token=" + token;
        String html = """
                <table bgcolor="#F4F5F6" border="0" cellpadding="0" cellspacing="0" width="100%%">
                    <tbody>
                        <tr>
                            <td align="center" style="padding:15px" valign="top">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                    <tbody>
                                        <tr>
                                            <td align="center" valign="top">
                                                <table border="0" cellpadding="0" cellspacing="0" style="min-width:600px;width:600px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px" bgcolor="#ffffff" width="600">
                                                    <tbody>
                                                        <tr>
                                                            <td bgcolor="#ffffff" valign="top">
                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                    <tbody><tr>
                                                                        <td align="center" style="padding:24px 16px 24px 16px" valign="top">
                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                                <tbody><tr>
                                                                                    <td align="center" valign="top">
                                                                                        <h2 style="font-size: 36px; font-weight: 900; margin: 0 0 10px 0; color: #e50914; letter-spacing: -3px;">MY CINEMA</h2>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td align="center" valign="top" style="padding:8px 0 0 0">
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:16px;line-height:22px;padding:0;margin:0;font-weight:bold">Yêu cầu đặt lại mật khẩu</p>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody></table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td align="left" style="padding:0 16px 24px 16px" valign="top">
                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                                <tbody><tr>
                                                                                    <td align="left" valign="top">
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 32px 0">Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào đường dẫn bên dưới (có hiệu lực trong 30 phút):</p>
                                                                                        <div style="text-align:center; margin: 0 0 32px 0;">
                                                                                            <a href="%s" style="background-color: #e50914; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 0px; font-size: 16px;">ĐẶT LẠI MẬT KHẨU</a>
                                                                                        </div>
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.<br></p>
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:30px 0 0 0;margin:0">Trân trọng,<br>MyCinema Team.</p>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody></table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="padding:20px 16px 20px 16px;background:#e7e4e1;color:#777e90;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px" valign="top" align="left">
                                                                            <table width="100%%" cellspacing="0" cellpadding="0" border="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td valign="top" align="left">
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0;font-weight:600">CÔNG TY TNHH MY CINEMA VIỆT NAM</p>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0">Địa chỉ: Hà Nội, Việt Nam</p>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0">Hotline: (028) 3775 2524</p>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0">COPYRIGHT &copy; MYCINEMA - ALL RIGHTS RESERVED.</p>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody></table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                """.formatted(resetLink);
        mailService.sendMail(email, "Đặt lại mật khẩu - MyCinema", html);

        // Trả message chung (không trả token ra ngoài)
        return Map.of(
                "message", "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu về email của bạn. Vui lòng kiểm tra email và làm theo hướng dẫn."
        );
    }

    @Transactional
    public Map<String, Object> validateResetToken(String token) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(token).orElse(null);
        if (prt == null || prt.isUsed() || prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn");
        }
        return Map.of(
                "valid", true,
                "expiresAt", prt.getExpiresAt()
        );
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận không khớp");
        }

        PasswordResetToken prt = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ hoặc đã hết hạn"));

        if (prt.isUsed() || prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn");
        }

        Account account = prt.getAccount();
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        // Đánh dấu token đã dùng
        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);

        // Sinh JWT sau khi reset thành công (tùy chọn: có thể bắt user login lại)
        String token = tokenProvider.generateToken(Map.of("username", account.getUsername()));
        List<String> roles = account.getAccountPermissions() != null
                ? account.getAccountPermissions().stream()
                .map(ap -> ap.getRole().getRoleName())
                .toList()
                : List.of("CUSTOMER");

        return AuthResponse.builder()
                .token(token)
                .username(account.getUsername())
                .roles(roles)
                .message("Đổi mật khẩu thành công")
                .build();
    }
}