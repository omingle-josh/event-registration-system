package com.event.auth.controller;

import com.event.auth.dto.UpdateProfileRequest;
import com.event.auth.dto.UserRequest;
import com.event.auth.dto.UserResponse;
import com.event.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User Profile", description = "Endpoints for authenticated users")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }
}
