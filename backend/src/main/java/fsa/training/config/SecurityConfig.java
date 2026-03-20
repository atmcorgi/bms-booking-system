package fsa.training.config;

import fsa.training.security.JpaUserDetailsService;
import fsa.training.security.jwt.JwtTokenProvider;
import fsa.training.security.jwt.TokenProvider;
import fsa.training.security.jwt.authentication.JwtAuthenticationConverter;
import fsa.training.security.jwt.authentication.JwtAuthenticationFilter;
import fsa.training.security.jwt.authentication.JwtAuthenticationProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

	@Value("${app.frontend.base-url:http://localhost:5173}")
	private String frontendBaseUrl;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, JpaUserDetailsService jpaUserDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
		return http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.authorizeHttpRequests(auth -> auth
						// Root and health check endpoints
						.requestMatchers("/", "/actuator/**", "/actuator/health").permitAll()
						.requestMatchers("/error").permitAll()
					// REST API rules
						.requestMatchers("/api/auth/login").permitAll()
						.requestMatchers("/api/auth/google").permitAll()
						.requestMatchers("/api/auth/signup").permitAll()
						.requestMatchers("/api/auth/forgot-password").permitAll()
						.requestMatchers("/api/auth/reset-password").permitAll()
						.requestMatchers("/api/auth/reset-password/validate").permitAll()
						.requestMatchers("/api/auth/logout").permitAll()
						.requestMatchers("/api/auth/me").authenticated()
						.requestMatchers("/api/movies/**").permitAll()
						.requestMatchers("/api/banners").permitAll()
						.requestMatchers("/api/booking/**").permitAll()
						.requestMatchers("/booking/api/**").permitAll()
                        .requestMatchers("/api/images/optimize").permitAll()
						.requestMatchers("/api/genres/**").permitAll()
                        .requestMatchers("/api/images/upload-poster").hasAnyAuthority("ADMIN","STAFF")
                        .requestMatchers("/api/images/upload-trailer").hasAnyAuthority("ADMIN","STAFF")
                        .requestMatchers("/api/images/**").hasAuthority("ADMIN")
						.requestMatchers("/api/theaters/**").permitAll()
						.requestMatchers("/api/test/**").permitAll()
						.requestMatchers("/api/test/cloudinary/**").permitAll()
						.requestMatchers("/api/admin/**").hasAuthority("ADMIN")
						.requestMatchers("/api/staff/**").hasAuthority("STAFF")
                        .requestMatchers("/api/statistics/**").hasAnyAuthority("ADMIN", "STAFF")
						.requestMatchers("/api/**").authenticated()
						// Static resources
						.requestMatchers("/resources/**", "/css/**", "/js/**", "/imgs/**", "/webjars/**").permitAll()
						.anyRequest().permitAll() // Allow all other requests for now (can be changed to authenticated() if needed)
						)
				// Disable form login for REST API only architecture
				.formLogin(form -> form.disable())
				.logout(logout -> logout.disable())
				.userDetailsService(jpaUserDetailsService)
				.addFilterAfter(jwtAuthenticationFilter, LogoutFilter.class)
				.exceptionHandling(ex -> ex
					.authenticationEntryPoint((request, response, authException) -> {
						response.setContentType("application/json");
						response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
						response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Vui lòng đăng nhập để truy cập\",\"code\":\"UNAUTHORIZED\"}");
					})
					.accessDeniedHandler((request, response, accessDeniedException) -> {
						response.setContentType("application/json");
						response.setStatus(HttpServletResponse.SC_FORBIDDEN);
						response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Bạn không có quyền truy cập trang này\",\"code\":\"FORBIDDEN\"}");
					})
				)
				.headers(headers -> headers
					.frameOptions(frame -> frame.deny())
					.contentTypeOptions(contentType -> {})
					.httpStrictTransportSecurity(hsts -> hsts
						.includeSubDomains(true)
						.maxAgeInSeconds(31536000)
					)
				)
				.build();
	}

	// Removed roleBasedSuccessHandler - not needed for REST API only architecture

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	// Expose TokenProvider bean backed by properties without clashing with component name
	@Bean
	public TokenProvider tokenProvider(
			@Value("${security.jwt.secret:your_default_secret_key}") String secret,
			@Value("${security.jwt.issuer:bms-system}") String issuer,
			@Value("${security.jwt.expiration-seconds:3600}") long expirationSeconds) {
		return new JwtTokenProvider(secret, issuer, expirationSeconds);
	}

	@Bean
	public JwtAuthenticationProvider jwtAuthenticationProvider(TokenProvider tokenProvider, UserDetailsService userDetailsService) {
		return new JwtAuthenticationProvider(tokenProvider, userDetailsService);
	}

	@Bean
	public JwtAuthenticationFilter jwtAuthenticationFilter(JwtAuthenticationProvider jwtAuthenticationProvider) {
		AuthenticationManager authenticationManager = new ProviderManager(jwtAuthenticationProvider);
		return new JwtAuthenticationFilter(authenticationManager, new JwtAuthenticationConverter());
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(Arrays.asList("*"));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);
		
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}