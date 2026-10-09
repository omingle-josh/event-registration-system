package com.event.registration.controller;

import com.event.registration.dto.TicketVerificationRequest;
import com.event.registration.dto.TicketVerificationResponse;
import com.event.registration.entity.Registration;
import com.event.registration.entity.RegistrationStatus;
import com.event.registration.repository.RegistrationRepository;
import com.event.registration.service.TicketSignatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/registrations/organizer")
@RequiredArgsConstructor
public class CheckInController {

    private final RegistrationRepository registrationRepository;
    private final TicketSignatureService ticketSignatureService;

    @PostMapping("/verify-ticket")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<TicketVerificationResponse> verifyTicket(@RequestBody TicketVerificationRequest request) {
        String rawData = request.getRawData();
        if (rawData == null || !rawData.contains(":")) {
            return ResponseEntity.badRequest().body(TicketVerificationResponse.builder()
                    .valid(false)
                    .message("Invalid ticket format")
                    .build());
        }

        String[] parts = rawData.split(":");
        if (parts.length != 2) {
             return ResponseEntity.badRequest().body(TicketVerificationResponse.builder()
                    .valid(false)
                    .message("Invalid ticket format details")
                    .build());
        }

        try {
            Long registrationId = Long.parseLong(parts[0]);
            String signature = parts[1];

            Registration registration = registrationRepository.findById(registrationId).orElse(null);
            if (registration == null) {
                return ResponseEntity.ok(TicketVerificationResponse.builder()
                        .valid(false)
                        .message("Registration not found")
                        .build());
            }

            boolean isValid = ticketSignatureService.verifySignature(registrationId, registration.getUserEmail(), signature);
            if (!isValid) {
                return ResponseEntity.ok(TicketVerificationResponse.builder()
                        .valid(false)
                        .message("Invalid ticket signature")
                        .build());
            }

            if (registration.getStatus() == RegistrationStatus.CHECKED_IN) {
                return ResponseEntity.ok(TicketVerificationResponse.builder()
                        .valid(true)
                        .message("Ticket already checked in")
                        .registrationId(registrationId)
                        .userEmail(registration.getUserEmail())
                        .currentStatus(registration.getStatus())
                        .build());
            }

            if (registration.getStatus() != RegistrationStatus.CONFIRMED) {
                 return ResponseEntity.ok(TicketVerificationResponse.builder()
                        .valid(false)
                        .message("Registration is not confirmed. Current status: " + registration.getStatus())
                        .build());
            }

            // Mark as checked in
            registration.setStatus(RegistrationStatus.CHECKED_IN);
            registrationRepository.save(registration);

            return ResponseEntity.ok(TicketVerificationResponse.builder()
                    .valid(true)
                    .message("Successfully checked in!")
                    .registrationId(registrationId)
                    .userEmail(registration.getUserEmail())
                    .currentStatus(RegistrationStatus.CHECKED_IN)
                    .build());

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(TicketVerificationResponse.builder()
                    .valid(false)
                    .message("Invalid registration ID in ticket")
                    .build());
        }
    }
}
