package com.event.auth.security.oauth2;

import com.event.auth.entity.User;
import com.event.auth.repository.RefreshTokenRepository;
import com.event.auth.entity.RefreshToken;
import com.event.auth.security.JwtUtil;
import com.event.auth.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;

import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    
    @Autowired
    @Lazy
    private AuthService authService;


    @Value("${oauth2.success.redirect-uri:http://localhost:5173/auth/oauth2/redirect}")

    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refreshToken = authService.createRefreshToken(user);


        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("role", user.getRole().name())
                .queryParam("email", user.getEmail())
                .build().toUriString();

        log.info("OAuth2 login success for user: {}. Redirecting to frontend.", user.getEmail());
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

