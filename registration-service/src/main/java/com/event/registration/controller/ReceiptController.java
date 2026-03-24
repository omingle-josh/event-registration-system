package com.event.registration.controller;

import com.event.registration.client.EventServiceClient;
import com.event.registration.dto.EventResponse;
import com.event.registration.entity.Payment;
import com.event.registration.entity.Receipt;
import com.event.registration.entity.Registration;
import com.event.registration.repository.PaymentRepository;
import com.event.registration.repository.ReceiptRepository;
import com.event.registration.repository.RegistrationRepository;
import com.event.registration.service.PdfGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptRepository receiptRepository;
    private final RegistrationRepository registrationRepository;
    private final PaymentRepository paymentRepository;
    private final EventServiceClient eventServiceClient;
    private final PdfGeneratorService pdfGeneratorService;

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id, Authentication authentication) {
        
        String email = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
        
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt strictly not found under ID: " + id));
                
        Registration registration = registrationRepository.findById(receipt.getRegistrationId())
                .orElseThrow(() -> new IllegalArgumentException("Associated context could not map to the event"));
                
        // Explicitly lock binary attachment distribution to the registrant or system ADMINs
        if (!email.equals(registration.getUserEmail()) && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Payment payment = paymentRepository.findByRegistrationId(registration.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment block was never processed successfully"));

        EventResponse event = eventServiceClient.getEventById(registration.getEventId());

        byte[] pdfBytes = pdfGeneratorService.generateReceiptPdf(receipt, registration, event, payment);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "receipt_" + receipt.getReceiptNumber() + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
