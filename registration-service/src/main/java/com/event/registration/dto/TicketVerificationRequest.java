package com.event.registration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketVerificationRequest {
    private String rawData; // The content of the QR code (registrationId:signature)
}
