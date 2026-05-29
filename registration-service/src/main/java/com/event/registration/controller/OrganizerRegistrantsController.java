package com.event.registration.controller;

import com.event.registration.dto.OrganizerRegistrantDto;
import com.event.registration.entity.RegistrationStatus;
import com.event.registration.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/registrations/organizer")
@RequiredArgsConstructor
public class OrganizerRegistrantsController {

    private final RegistrationService registrationService;

    @GetMapping("/events/{eventId}/registrants")
    public ResponseEntity<Page<OrganizerRegistrantDto>> listRegistrantsForEvent(
            @PathVariable Long eventId,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String organizerEmail
    ) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(registrationService.getOrganizerEventRegistrants(organizerEmail, eventId, status, pageable));
    }
}

