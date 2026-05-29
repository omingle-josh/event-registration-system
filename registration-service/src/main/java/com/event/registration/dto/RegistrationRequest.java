package com.event.registration.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RegistrationRequest {
    @NotNull(message = "Event ID cannot be null")
    @Positive(message = "Event ID must be a positive number")
    private Long eventId;
}
