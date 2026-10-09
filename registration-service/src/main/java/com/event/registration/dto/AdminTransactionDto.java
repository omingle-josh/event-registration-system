package com.event.registration.dto;

import com.event.registration.entity.PaymentStatus;
import com.event.registration.entity.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminTransactionDto {
    private Long registrationId;
    private Long eventId;

    private String eventName;
    private LocalDateTime eventDate;
    private String eventVenue;

    private String userEmail;

    private RegistrationStatus registrationStatus;
    private PaymentStatus paymentStatus;

    private String receiptNumber; // null if not available yet / not confirmed

    private Long receiptId; // null if no receipt created yet

    private LocalDateTime createdAt;
}

