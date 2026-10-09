package com.event.auth.service;

import com.event.auth.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    // Runs every hour to clean up expired and abandoned tokens
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Running scheduled cleanup for expired password reset tokens.");
        LocalDateTime now = LocalDateTime.now();
        passwordResetTokenRepository.findAll().stream()
                .filter(token -> token.getExpiryDate().isBefore(now) || token.getAttempts() >= 5)
                .forEach(token -> {
                    passwordResetTokenRepository.delete(token);
                    log.debug("Deleted expired/exhausted token for email: {}", token.getUserEmail());
                });
        log.info("Token cleanup completed.");
    }
}
