package com.event.registration.controller;

import com.event.registration.service.RazorpayWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks/razorpay")
@RequiredArgsConstructor
public class WebhookController {

    private final RazorpayWebhookService webhookService;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestBody String payload) {
        
        webhookService.processWebhook(signature, payload);
        
        return ResponseEntity.ok("OK");
    }
}
