package com.event.auth.service;

import com.event.auth.dto.LoginRequest;
import com.event.auth.dto.LoginResponse;
import com.event.auth.entity.User;
import com.event.auth.exception.InvalidCredentialsException;
import com.event.auth.exception.UserNotFoundException;
import com.event.auth.dto.UserRequest;
import com.event.auth.dto.UserResponse;
import com.event.auth.entity.Role;
import com.event.auth.repository.UserRepository;
import com.event.auth.repository.RefreshTokenRepository;
import com.event.auth.entity.RefreshToken;
import com.event.auth.dto.TokenRefreshRequest;
import com.event.auth.dto.TokenRefreshResponse;
import com.event.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final com.event.auth.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.event.auth.service.AuthEmailService authEmailService;
    private final MeterRegistry meterRegistry;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @PostConstruct
    public void initMetrics() {
        meterRegistry.gauge("active_refresh_tokens_count", refreshTokenRepository, RefreshTokenRepository::count);
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + request.getEmail()));

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refreshToken = createRefreshToken(user);

        meterRegistry.counter("user_logins_total", "provider", "local").increment();

        return new LoginResponse(accessToken, refreshToken, user.getRole(), user.getEmail());
    }

    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String rawToken = request.getRefreshToken();
        String[] parts = rawToken.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid refresh token format");
        }

        UUID tokenId;
        try {
            tokenId = UUID.fromString(parts[0]);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid token ID");
        }
        String rawSecret = parts[1];

        RefreshToken refreshToken = refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new IllegalArgumentException("Refresh token expired");
        }

        if (!hashToken(rawSecret).equals(refreshToken.getTokenHash())) {
            throw new IllegalArgumentException("Invalid refresh token secret");
        }

        // Token is valid - Rotate it
        User user = refreshToken.getUser();
        refreshTokenRepository.delete(refreshToken);

        String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String newRefreshToken = createRefreshToken(user);

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .role(user.getRole())
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public void logout(String rawToken) {
        String[] parts = rawToken.split(":");
        if (parts.length == 2) {
            try {
                UUID tokenId = UUID.fromString(parts[0]);
                refreshTokenRepository.deleteById(tokenId);
            } catch (IllegalArgumentException ignored) {}
        }
    }

    public String createRefreshToken(User user) {
        String rawSecret = generateRandomSecret();
        UUID tokenId = UUID.randomUUID();
        
        RefreshToken refreshToken = RefreshToken.builder()
                .id(tokenId)
                .user(user)
                .tokenHash(hashToken(rawSecret))
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .build();
                
        refreshTokenRepository.save(refreshToken);
        return tokenId + ":" + rawSecret;
    }

    private String generateRandomSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    public UserResponse registerRegistrant(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.REGISTRANT)
                .build();
                
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
    }

    @Transactional
    public void initiateForgotPassword(String email) {
        // Find existing token
        java.util.Optional<com.event.auth.entity.PasswordResetToken> existingToken = passwordResetTokenRepository.findByUserEmail(email);
        
        if (existingToken.isPresent()) {
            com.event.auth.entity.PasswordResetToken token = existingToken.get();
            // Rate limit: 60 seconds
            if (token.getLastRequestedAt().plusSeconds(60).isAfter(java.time.LocalDateTime.now())) {
                // Return success silently for privacy/security without sending email
                return;
            }
            passwordResetTokenRepository.delete(token); // clear old token
        }

        // Generate 6-digit OTP
        String rawOtp = String.format("%06d", new java.util.Random().nextInt(999999));
        
        com.event.auth.entity.PasswordResetToken newToken = com.event.auth.entity.PasswordResetToken.builder()
                .userEmail(email)
                .hashedOtp(passwordEncoder.encode(rawOtp))
                .attempts(0)
                .lastRequestedAt(java.time.LocalDateTime.now())
                .expiryDate(java.time.LocalDateTime.now().plusMinutes(15))
                .build();
                
        passwordResetTokenRepository.save(newToken);

        // Only send if user actually exists to avoid sending spam to non-existent emails
        // But do not throw exception if user doesn't exist to protect user privacy
        if (userRepository.existsByEmail(email)) {
            authEmailService.sendPasswordResetOtp(email, rawOtp);
        }
    }

    @Transactional
    public void resetPassword(String email, String rawOtp, String newPassword) {
        com.event.auth.entity.PasswordResetToken token = passwordResetTokenRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset code."));

        if (token.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            passwordResetTokenRepository.delete(token);
            throw new IllegalArgumentException("Reset code has expired.");
        }

        if (token.getAttempts() >= 5) {
            passwordResetTokenRepository.delete(token);
            throw new IllegalArgumentException("Too many invalid attempts. Please request a new code.");
        }

        if (!passwordEncoder.matches(rawOtp, token.getHashedOtp())) {
            token.setAttempts(token.getAttempts() + 1);
            passwordResetTokenRepository.save(token);
            throw new IllegalArgumentException("Invalid reset code.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Clean up token after successful reset
        passwordResetTokenRepository.delete(token);
    }
}
