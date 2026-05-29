package com.event.registration.service;

import com.event.registration.dto.EmailEvent;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final PdfGeneratorService pdfGeneratorService;
    private final TicketSignatureService ticketSignatureService;
    private final QrCodeService qrCodeService;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Async
    @Retryable(
            value = {Exception.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    public void sendBookingConfirmation(EmailEvent event) {
        log.info("Attempting to send booking confirmation email to: {}", event.getUserEmail());

        try {
            byte[] pdfBytes = pdfGeneratorService.generateReceiptPdf(event);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(event.getUserEmail());
            helper.setSubject("Event Registration Confirmation: " + event.getEventName());

            String signature = ticketSignatureService.generateSignature(event.getRegistrationId(), event.getUserEmail());
            String qrContent = event.getRegistrationId() + ":" + signature;
            byte[] qrBytes = qrCodeService.generateQrCodeBytes(qrContent, 200, 200);
            
            String htmlContent = String.format(
                    "<html><body>" +
                    "<h2>Hello,</h2>" +
                    "<p>Your registration for <strong>%s</strong> is confirmed!</p>" +
                    "<p>Please find your ticket/receipt attached. You can also use the QR code below for entry:</p>" +
                    "<img src='cid:qrCode' />" +
                    "<p><br/>Thank you,<br/>The Latent Team</p>" +
                    "</body></html>",
                    event.getEventName()
            );
            helper.setText(htmlContent, true);

            helper.addInline("qrCode", new ByteArrayResource(qrBytes), "image/png");
            helper.addAttachment("Receipt_" + event.getReceiptNumber() + ".pdf", new ByteArrayResource(pdfBytes));

            javaMailSender.send(message);

            log.info("EMAIL_SENT successfully to: {}", event.getUserEmail());

        } catch (Exception e) {
            log.error("Failed to send email to {}. Error: {}", event.getUserEmail(), e.getMessage());
            throw new RuntimeException("Email sending failed, triggering retry", e);
        }
    }

    @Recover
    public void recoverSendBookingConfirmation(Exception e, EmailEvent event) {
        log.error("EMAIL_FAILED: Exhausted all retries sending email to: {}. Final error: {}", event.getUserEmail(), e.getMessage());
        // In a real production system, you might want to save this failed event to a DB table or dead-letter queue (if Kafka was used)
        // so an admin can manually retry or investigate.
    }
}
