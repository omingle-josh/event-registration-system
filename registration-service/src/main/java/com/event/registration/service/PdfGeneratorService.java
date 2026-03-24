package com.event.registration.service;

import com.event.registration.dto.EventResponse;
import com.event.registration.entity.Payment;
import com.event.registration.entity.Receipt;
import com.event.registration.entity.Registration;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    public byte[] generateReceiptPdf(Receipt receipt, Registration registration, EventResponse event, Payment payment) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Paragraph title = new Paragraph("OMINGLE EVENT TICKET", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(25);
            document.add(title);

            // Receipt Metadata
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            
            document.add(new Paragraph("Receipt Number: " + receipt.getReceiptNumber(), boldFont));
            document.add(new Paragraph("Generated On: " + receipt.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), normalFont));
            document.add(new Paragraph(" \n ", normalFont));

            // Event Metadata
            document.add(new Paragraph("--- EVENT DETAILS ---", boldFont));
            document.add(new Paragraph("Event Name: " + event.getName(), normalFont));
            document.add(new Paragraph("Date: " + event.getDate().toString(), normalFont));
            document.add(new Paragraph("Venue: " + event.getVenue(), normalFont));
            document.add(new Paragraph(" \n ", normalFont));

            // Participant Context
            document.add(new Paragraph("--- REGISTRANT DETAILS ---", boldFont));
            document.add(new Paragraph("Email: " + registration.getUserEmail(), normalFont));
            document.add(new Paragraph("Ticket Status: " + registration.getStatus().name(), normalFont));
            document.add(new Paragraph(" \n ", normalFont));

            // Financial Context
            document.add(new Paragraph("--- PAYMENT DETAILS ---", boldFont));
            document.add(new Paragraph("Amount Paid: " + payment.getAmount() + " INR", normalFont));
            document.add(new Paragraph("Currency: INR", normalFont));
            document.add(new Paragraph("Payment Method: " + payment.getPaymentMethod().name(), normalFont));
            document.add(new Paragraph("Transaction Reference: " + (payment.getTransactionRef() != null ? payment.getTransactionRef() : "N/A"), normalFont));
            
            document.close();
            return out.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Error rendering PDF binary stream: " + e.getMessage(), e);
        }
    }
}
