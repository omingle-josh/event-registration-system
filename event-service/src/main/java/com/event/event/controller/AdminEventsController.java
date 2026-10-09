package com.event.event.controller;

import com.event.event.dto.EventResponse;
import com.event.event.entity.EventStatus;
import com.event.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/events/admin/events")
@RequiredArgsConstructor
public class AdminEventsController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<Page<EventResponse>> listEventsByStatus(
            @RequestParam(defaultValue = "OPEN") EventStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "date"));
        return ResponseEntity.ok(eventService.getEventsByStatus(status, pageable));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countEventsByStatus(@RequestParam(defaultValue = "OPEN") EventStatus status) {
        return ResponseEntity.ok(eventService.countEventsByStatus(status));
    }
}

