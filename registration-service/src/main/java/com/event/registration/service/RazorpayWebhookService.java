package com.event.registration.service;

import com.event.registration.entity.*;
import com.event.registration.exception.UnauthorizedException;
import com.event.registration.repository.PaymentRepository;
import com.event.registration.repository.ReceiptRepository;
import com.event.registration.repository.RegistrationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import com.event.registration.client.EventServiceClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RazorpayWebhookService {

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    private final PaymentRepository paymentRepository;
    private final RegistrationRepository registrationRepository;
    private final ReceiptRepository receiptRepository;
    private final ObjectMapper objectMapper;
    private final EventServiceClient eventServiceClient;

    @Transactional
    public void processWebhook(String signature, String payload) {
        verifySignature(signature, payload);

        try {
            JsonNode root = objectMapper.readTree(payload);
            String event = root.path("event").asText();

            JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
            String transactionRef = paymentEntity.path("id").asText();
            
            // Isolate custom notes to map the transactional relationship back to our DB
            Long registrationId = paymentEntity.path("notes").path("registration_id").asLong(0);
            
            if (registrationId == 0) return; // Ignores irrelevant webhook events gracefully
            
            if ("payment.captured".equals(event)) {
                handlePaymentCaptured(registrationId, transactionRef, paymentEntity);
            } else if ("payment.failed".equals(event)) {
                handlePaymentFailed(registrationId, transactionRef);
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Error mapping Razorpay webhook payload: " + e.getMessage());
        }
    }

    private void handlePaymentCaptured(Long registrationId, String transactionRef, JsonNode paymentEntity) {
        Payment payment = paymentRepository.findByRegistrationId(registrationId).orElse(null);
        if (payment == null || payment.getPaymentStatus() == PaymentStatus.SUCCESS) return; // Idempotent short-circuit

        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setTransactionRef(transactionRef);
        payment.setPaidAt(LocalDateTime.now());

        Registration registration = registrationRepository.findById(registrationId).orElseThrow();
        registration.setStatus(RegistrationStatus.CONFIRMED);
        // 3. Freeze a historic Receipt Snapshot
        String receiptCode = "REC-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Receipt receipt = Receipt.builder()
                .registrationId(registrationId)
                .receiptNumber(receiptCode)
                .build();
                
        receiptRepository.save(receipt);
    }

    private void handlePaymentFailed(Long registrationId, String transactionRef) {
        Payment payment = paymentRepository.findByRegistrationId(registrationId).orElse(null);
        if (payment != null && payment.getPaymentStatus() != PaymentStatus.FAILED) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setTransactionRef(transactionRef);
            
            Registration registration = registrationRepository.findById(registrationId).orElse(null);
            if (registration != null && registration.getStatus() != RegistrationStatus.CANCELLED) {
                registration.setStatus(RegistrationStatus.CANCELLED);
                try {
                    eventServiceClient.releaseSeat(registration.getEventId());
                } catch (Exception e) {
                    System.err.println("CRITICAL: Failed to release the natively locked seat for cancelled registration: " + registrationId);
                }
            }
        }
    }

    private void verifySignature(String signature, String payload) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] bytes = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            String expectedSignature = sb.toString();

            if (!expectedSignature.equals(signature)) {
                throw new UnauthorizedException("Webhook signature verification failed.");
            }
        } catch (UnauthorizedException e) {
            throw e; 
        } catch (Exception e) {
            throw new UnauthorizedException("Internal error verifying webhook signature.");
        }
    }
}
