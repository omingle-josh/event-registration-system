package com.event.registration.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventResponse {
    private Long id;
    private String name;
    private LocalDateTime date;
    private String venue;
    private String status;
    private Integer availableSeats;
    private Double fee;
}
