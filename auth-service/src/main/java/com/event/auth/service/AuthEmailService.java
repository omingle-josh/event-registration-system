package com.event.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthEmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendPasswordResetOtp(String to, String otpCode) {
        log.info("Sending password reset OTP to: {}", to);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("  Password Reset Verification Code");
            message.setText("Hello,\n\n" +
                    "You recently requested to reset your password for your account.\n" +
                    "Here is your 6-digit confirmation code:\n\n" +
                    otpCode + "\n\n" +
                    "This code will expire in 15 minutes. " +
                    "If you did not request this password reset, please ignore this email.\n\n" +
                    "Thank you,\n" +
                    "The Omingle Team");

            javaMailSender.send(message);
            log.info("Password reset OTP successfully sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP to: {}. Error: {}", to, e.getMessage());
        }
    }
}
