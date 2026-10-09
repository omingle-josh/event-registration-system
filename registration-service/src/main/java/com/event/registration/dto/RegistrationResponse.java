package com.event.registration.dto;

import com.event.registration.entity.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private String userEmail;
    private RegistrationStatus status;

    // Present only for fee=0 (instant confirmation) or after webhook receipt creation.
    private Long receiptId;
    private String receiptNumber;
    
    // Razorpay Checkout Payload
    private String razorpayOrderId;
    private String razorpayKeyId;
    private Double amount;
    private String currency;
}
