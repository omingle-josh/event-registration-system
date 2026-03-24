package com.event.registration.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationRequest {
    @NotNull(message = "Event ID cannot be null")
    private Long eventId;
}
