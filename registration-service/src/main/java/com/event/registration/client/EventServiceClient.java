package com.event.registration.client;

import com.event.registration.dto.EventResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "EVENT-SERVICE")
public interface EventServiceClient {

    @GetMapping("/events/{id}")
    EventResponse getEventById(@PathVariable("id") Long id);

    @PostMapping("/events/{id}/reserve-seat")
    void reserveSeat(@PathVariable("id") Long id);

    @PostMapping("/events/{id}/release-seat")
    void releaseSeat(@PathVariable("id") Long id);
}
