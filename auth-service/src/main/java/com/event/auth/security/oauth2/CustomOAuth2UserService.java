package com.event.auth.security.oauth2;

import com.event.auth.entity.Role;
import com.event.auth.entity.User;
import com.event.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN password DROP NOT NULL");
        } catch (Exception e) {
            log.error("DATABASE PATCH FAILED: {}", e.getMessage());
        }
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String providerName = userRequest.getClientRegistration().getRegistrationId();
        
        if (providerName.equalsIgnoreCase(User.AuthProvider.GOOGLE.name())) {
            return processGoogleUser(oAuth2User);
        }

        return oAuth2User;
    }

    private OAuth2User processGoogleUser(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from Google");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Safe check for null or LOCAL provider
            if (user.getProvider() == null || user.getProvider() == User.AuthProvider.LOCAL) {
                user.setProvider(User.AuthProvider.GOOGLE);
                user.setProviderId(providerId);
                userRepository.save(user);
            }
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .role(Role.REGISTRANT)
                    .provider(User.AuthProvider.GOOGLE)
                    .providerId(providerId)
                    .build();
            userRepository.save(user);
        }

        return new CustomOAuth2User(oAuth2User, user);
    }
}
