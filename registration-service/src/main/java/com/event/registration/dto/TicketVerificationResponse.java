package com.event.registration.dto;

import com.event.registration.entity.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketVerificationResponse {
    private boolean valid;
    private String message;
    private Long registrationId;
    private String userEmail;
    private RegistrationStatus currentStatus;
}
