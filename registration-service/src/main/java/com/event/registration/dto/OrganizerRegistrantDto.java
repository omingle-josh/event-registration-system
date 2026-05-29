package com.event.registration.dto;

import com.event.registration.entity.PaymentStatus;
import com.event.registration.entity.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrganizerRegistrantDto {
    private Long registrationId;
    private Long eventId;

    private String userEmail;

    private RegistrationStatus registrationStatus;
    private PaymentStatus paymentStatus;

    private Long receiptId;
    private String receiptNumber;

    private LocalDateTime createdAt;
}

