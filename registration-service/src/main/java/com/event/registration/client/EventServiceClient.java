package com.event.registration.client;

import com.event.registration.dto.EventResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "EVENT-SERVICE")
public interface EventServiceClient {

    @GetMapping("/events/{id}")
    EventResponse getEventById(@PathVariable("id") Long id);

    @GetMapping("/events/bulk")
    List<EventResponse> getEventsBulk(@RequestParam("ids") String ids);

    @PostMapping("/events/{id}/reserve-seat")
    void reserveSeat(@PathVariable("id") Long id);

    @PostMapping("/events/{id}/release-seat")
    void releaseSeat(@PathVariable("id") Long id);
}
