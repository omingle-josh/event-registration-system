package com.event.registration.controller;

import com.event.registration.dto.RegistrationRequest;
import com.event.registration.dto.RegistrationResponse;
import com.event.registration.dto.MyBookingResponse;
import com.event.registration.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(
            @AuthenticationPrincipal String userEmail,
            @Valid @RequestBody RegistrationRequest request) {

        return ResponseEntity.ok(registrationService.register(request.getEventId(), userEmail));
    }

    @GetMapping("/me")
    public ResponseEntity<List<MyBookingResponse>> myBookings(@AuthenticationPrincipal String userEmail) {
        return ResponseEntity.ok(registrationService.getMyBookings(userEmail));
    }

    @GetMapping("/me/confirmed")
    public ResponseEntity<List<MyBookingResponse>> myConfirmedBookings(@AuthenticationPrincipal String userEmail) {
        return ResponseEntity.ok(registrationService.getMyConfirmedBookings(userEmail));
    }
}
