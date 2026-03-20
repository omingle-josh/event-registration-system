package com.event.event.controller;

import com.event.event.dto.EventRequest;
import com.event.event.dto.EventResponse;
import com.event.event.entity.EventStatus;
import com.event.event.exception.UnauthorizedException;
import com.event.event.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    private String extractUserEmail(String userEmailHeader) {
        if (userEmailHeader == null || userEmailHeader.isEmpty()) {
            throw new UnauthorizedException("User identity missing. Authenticated session required.");
        }
        return userEmailHeader;
    }

    private void requireOrganizerOrAdmin(String role) {
        if (!"ORGANIZER".equals(role) && !"ADMIN".equals(role)) {
            throw new UnauthorizedException("You do not have permission to perform this action.");
        }
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @Valid @RequestBody EventRequest request) {
        
        requireOrganizerOrAdmin(role);
        EventResponse createdEvent = eventService.createEvent(request, extractUserEmail(userEmail));
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @Valid @RequestBody EventRequest request) {
            
        requireOrganizerOrAdmin(role);
        return ResponseEntity.ok(eventService.updateEvent(id, request, extractUserEmail(userEmail)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
            
        eventService.deleteEvent(id, extractUserEmail(userEmail));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EventResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam EventStatus status,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
            
        return ResponseEntity.ok(eventService.changeStatus(id, status, extractUserEmail(userEmail)));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getEvents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(required = false) String venue) {
            
        return ResponseEntity.ok(eventService.getEvents(name, minFee, maxFee, venue));
    }
}
