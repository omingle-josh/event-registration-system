package com.event.auth.controller;

import com.event.auth.dto.LoginRequest;
import com.event.auth.dto.LoginResponse;
import com.event.auth.dto.TokenRefreshRequest;
import com.event.auth.dto.TokenRefreshResponse;
import com.event.auth.dto.UserRequest;
import com.event.auth.dto.UserResponse;
import com.event.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new REGISTRANT account publicly")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerRegistrant(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Get a new access token using a refresh token")
    public ResponseEntity<TokenRefreshResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Invalidate a refresh token")
    public ResponseEntity<Void> logout(@RequestBody TokenRefreshRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password reset via Email OTP")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(@Valid @RequestBody com.event.auth.dto.ForgotPasswordRequest request) {
        authService.initiateForgotPassword(request.getEmail());
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "If an account is associated with this email, a reset code has been sent.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Complete password reset via Email OTP")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@Valid @RequestBody com.event.auth.dto.ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getOtpCode(), request.getNewPassword());
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Password has been successfully reset. You can now login.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
