package fsa.training.config;

import fsa.training.security.JpaUserDetailsService;
import fsa.training.security.jwt.JwtTokenProvider;
import fsa.training.security.jwt.TokenProvider;
import fsa.training.security.jwt.authentication.JwtAuthenticationConverter;
import fsa.training.security.jwt.authentication.JwtAuthenticationFilter;
import fsa.training.security.jwt.authentication.JwtAuthenticationProvider;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, JpaUserDetailsService jpaUserDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
		return http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.and())
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/error").permitAll()
						// REST API rules
						.requestMatchers("/api/auth/login").permitAll()
						.requestMatchers("/api/auth/logout").permitAll()
						.requestMatchers("/api/auth/me").authenticated()
						.requestMatchers("/api/movies/**").permitAll()
						.requestMatchers("/api/booking/**").permitAll()
						.requestMatchers("/booking/api/**").permitAll()
                        .requestMatchers("/api/images/optimize").permitAll()
                        .requestMatchers("/api/images/upload-poster").hasAnyAuthority("ADMIN","STAFF")
                        .requestMatchers("/api/images/upload-trailer").hasAnyAuthority("ADMIN","STAFF")
                        .requestMatchers("/api/images/**").hasAuthority("ADMIN")
						.requestMatchers("/api/theaters/**").permitAll()
						.requestMatchers("/api/test/**").permitAll()
						.requestMatchers("/api/test/cloudinary/**").permitAll()
						.requestMatchers("/api/admin/**").hasAuthority("ADMIN")
						.requestMatchers("/api/staff/**").hasAuthority("STAFF")
						.requestMatchers("/api/**").authenticated()
						// Static resources
						.requestMatchers("/resources/**", "/css/**", "/js/**", "/imgs/**", "/webjars/**").permitAll()
						.anyRequest().authenticated()
						)
				// Disable form login for REST API only architecture
				.formLogin(form -> form.disable())
				.logout(logout -> logout.disable())
				.userDetailsService(jpaUserDetailsService)
				.addFilterAfter(jwtAuthenticationFilter, LogoutFilter.class)
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
}