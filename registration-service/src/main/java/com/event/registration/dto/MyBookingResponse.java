package com.event.registration.dto;

import com.event.registration.entity.PaymentStatus;
import com.event.registration.entity.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MyBookingResponse {
    private Long id; // registration id
    private Long eventId;
    private RegistrationStatus status;
    private PaymentStatus paymentStatus;

    private Long receiptId; // null until payment captured
    private String receiptNumber; // null until payment captured

    private String qrCode; // Base64 encoded QR image for the ticket

    private LocalDateTime createdAt;
}

