package com.event.auth.controller;

import com.event.auth.dto.UserRequest;
import com.event.auth.dto.UserResponse;
import com.event.auth.entity.Role;
import com.event.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Management", description = "Endpoints restricted to ADMIN role")
public class AdminController {

    private final UserService userService;

    @PostMapping("/organizers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create an organizer")
    public ResponseEntity<UserResponse> createOrganizer(@Valid @RequestBody UserRequest request) {
        UserResponse response = userService.createUser(request, Role.ORGANIZER);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/registrants")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a registrant")
    public ResponseEntity<UserResponse> createRegistrant(@Valid @RequestBody UserRequest request) {
        UserResponse response = userService.createUser(request, Role.REGISTRANT);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
