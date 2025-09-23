package fsa.training.security.jwt.authentication;

import fsa.training.security.jwt.TokenProvider;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Map;

public class JwtAuthenticationProvider implements AuthenticationProvider {
    private final TokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationProvider(TokenProvider tokenProvider, UserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String token = authentication.getCredentials().toString();
        boolean isValidToken = tokenProvider.validateToken(token);
        if (!isValidToken)
            return null;
        Map<String, Object> payload = tokenProvider.getPayload(token);
        String principal = payload.get("username").toString();
        UserDetails userDetails = userDetailsService.loadUserByUsername(principal);
        JwtAuthenticationToken authenticated = new JwtAuthenticationToken(userDetails.getAuthorities(), principal, token);
        authenticated.setAuthenticated(true);
        return authenticated;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return JwtAuthenticationToken.class.isAssignableFrom(authentication);
    }
}