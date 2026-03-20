package com.event.event.dto;

import com.event.event.entity.EventStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EventResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime date;
    private String venue;
    private Double fee;
    private Integer capacity;
    private Integer availableSeats;
    private EventStatus status;
    private String organizerEmail;
}
