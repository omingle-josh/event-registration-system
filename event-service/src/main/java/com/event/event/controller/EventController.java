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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> createEvent(
            @AuthenticationPrincipal String userEmail,
            @Valid @RequestBody EventRequest request) {
        
        EventResponse createdEvent = eventService.createEvent(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal String userEmail,
            @Valid @RequestBody EventRequest request) {
            
        return ResponseEntity.ok(eventService.updateEvent(id, request, userEmail));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal String userEmail) {
            
        eventService.deleteEvent(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam EventStatus status,
            @AuthenticationPrincipal String userEmail) {
            
        return ResponseEntity.ok(eventService.changeStatus(id, status, userEmail));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getEvents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(required = false) String venue) {
            
        return ResponseEntity.ok(eventService.getEvents(name, minFee, maxFee, venue));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping("/{id}/reserve-seat")
    public ResponseEntity<Void> reserveSeat(@PathVariable Long id) {
        eventService.reserveSeat(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/release-seat")
    public ResponseEntity<Void> releaseSeat(@PathVariable Long id) {
        eventService.releaseSeat(id);
        return ResponseEntity.ok().build();
    }
}
