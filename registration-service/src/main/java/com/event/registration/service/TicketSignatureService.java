package com.event.registration.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class TicketSignatureService {

    @Value("${app.ticket.secret:ticket-secret-key-123456789}")
    private String secretKey;

    public String generateSignature(Long registrationId, String userEmail) {
        try {
            String data = registrationId + ":" + userEmail;
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error generating ticket signature", e);
        }
    }

    public boolean verifySignature(Long registrationId, String userEmail, String signature) {
        String expectedSignature = generateSignature(registrationId, userEmail);
        return expectedSignature.equals(signature);
    }
}
