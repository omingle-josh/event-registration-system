package com.event.registration.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Lightweight DTO passed directly to EmailService to avoid redundant DB lookups.
 * All data is assembled at the call site (RegistrationService / RazorpayWebhookService)
 * where the entities are already in memory.
 */
@Data
@Builder
public class EmailEvent {
    private String userEmail;
    private Long registrationId;
    private String eventName;
    private String eventVenue;
    private LocalDateTime eventDate;
    private Double amount;
    private String receiptNumber;
    private String transactionRef;
    private String paymentMethod;
}
