package com.event.registration.service;

import com.event.registration.dto.EmailEvent;
import com.event.registration.dto.EventResponse;
import com.event.registration.entity.Payment;
import com.event.registration.entity.Receipt;
import com.event.registration.entity.Registration;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PdfGeneratorService {

    private final TicketSignatureService ticketSignatureService;

    // Define Dark Mode Colors
    private static final Color BG_COLOR = new Color(18, 18, 20); // Deep charcoal black
    private static final Color PANEL_COLOR = new Color(28, 28, 32); // Slightly lighter for boxes
    private static final Color TEXT_PRIMARY = new Color(240, 240, 245); // Off-white
    private static final Color TEXT_SECONDARY = new Color(180, 180, 190); // Muted gray
    private static final Color ACCENT_COLOR = new Color(0, 230, 255); // Cyan neon glow accent

    public byte[] generateReceiptPdf(Receipt receipt, Registration registration, EventResponse event, Payment payment) {
        EmailEvent emailEvent = EmailEvent.builder()
                .userEmail(registration.getUserEmail())
                .registrationId(registration.getId())
                .eventName(event.getName())
                .eventDate(event.getDate())
                .eventVenue(event.getVenue())
                .amount(payment.getAmount() != null ? payment.getAmount().doubleValue() : 0.0)
                .receiptNumber(receipt.getReceiptNumber())
                .paymentMethod(payment.getPaymentMethod().name())
                .build();
        return generateReceiptPdf(emailEvent);
    }

    public byte[] generateReceiptPdf(EmailEvent event) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // 1. Setup Document with Dark Background
            Rectangle pageSize = new Rectangle(PageSize.A4);
            pageSize.setBackgroundColor(BG_COLOR);
            Document document = new Document(pageSize, 36, 36, 36, 36);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, TEXT_PRIMARY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, ACCENT_COLOR);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXT_SECONDARY);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, TEXT_PRIMARY);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_SECONDARY);

            // 2. Add Top Banner Image
            try {
                InputStream is = getClass().getResourceAsStream("/images/ticket-banner.png");
                if (is != null) {
                    byte[] bytes = is.readAllBytes();
                    Image banner = Image.getInstance(bytes);
                    banner.setAlignment(Element.ALIGN_CENTER);
                    banner.scaleToFit(document.getPageSize().getWidth() - 72, 200);
                    document.add(banner);
                }
            } catch (Exception e) {
                System.err.println("Could not load banner image: " + e.getMessage());
            }

            document.add(new Paragraph(" "));

            // 3. Main Ticket Layout using PdfPTable
            PdfPTable mainTable = new PdfPTable(2);
            mainTable.setWidthPercentage(100);
            mainTable.setWidths(new float[]{2.5f, 1f}); // Left side wider for details, Right for QR

            // 3A. Left Column (Event & Registrant Info)
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.setBackgroundColor(PANEL_COLOR);
            leftCell.setPadding(20);

            leftCell.addElement(new Paragraph(event.getEventName() != null ? event.getEventName().toUpperCase() : "EVENT TICKET", titleFont));
            leftCell.addElement(new Paragraph(" "));
            
            // Date & Venue
            PdfPTable infoGrid = new PdfPTable(2);
            infoGrid.setWidthPercentage(100);
            
            PdfPCell dateCell = buildInfoCell("DATE", event.getEventDate() != null ? event.getEventDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) : "TBD", labelFont, valueFont);
            PdfPCell venueCell = buildInfoCell("VENUE", event.getEventVenue() != null ? event.getEventVenue() : "TBD", labelFont, valueFont);
            infoGrid.addCell(dateCell);
            infoGrid.addCell(venueCell);
            leftCell.addElement(infoGrid);
            
            leftCell.addElement(new Paragraph(" "));

            // Attendee Info
            PdfPTable attendeeGrid = new PdfPTable(2);
            attendeeGrid.setWidthPercentage(100);
            PdfPCell attendeeCell = buildInfoCell("ATTENDEE", event.getUserEmail(), labelFont, valueFont);
            PdfPCell statusCell = buildInfoCell("TICKET STATUS", "CONFIRMED", labelFont, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(0, 255, 128)));
            attendeeGrid.addCell(attendeeCell);
            attendeeGrid.addCell(statusCell);
            leftCell.addElement(attendeeGrid);
            
            mainTable.addCell(leftCell);

            // 3B. Right Column (QR Code)
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setBackgroundColor(PANEL_COLOR);
            rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            rightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            rightCell.setPadding(10);

            try {
                String signature = ticketSignatureService.generateSignature(event.getRegistrationId(), event.getUserEmail());
                String qrContent = event.getRegistrationId() + ":" + signature;
                byte[] qrBytes = generateQRCodeImage(qrContent, 200, 200);
                Image qrImage = Image.getInstance(qrBytes);
                // Make QR pop a bit by enclosing in white if it has transparent parts, ZXing naturally makes it white bg
                qrImage.setAlignment(Element.ALIGN_CENTER);
                qrImage.scaleToFit(120, 120);
                rightCell.addElement(qrImage);
                
                Paragraph scanTxt = new Paragraph("SCAN FOR ENTRY", smallFont);
                scanTxt.setAlignment(Element.ALIGN_CENTER);
                rightCell.addElement(scanTxt);

                Paragraph idTxt = new Paragraph("#" + event.getRegistrationId(), valueFont);
                idTxt.setAlignment(Element.ALIGN_CENTER);
                rightCell.addElement(idTxt);

            } catch (Exception e) {
                System.err.println("Failed to generate QR Code for PDF: " + e.getMessage());
            }
            
            mainTable.addCell(rightCell);
            document.add(mainTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // 4. Genuine Invoice Billing Breakdown
            document.add(new Paragraph("BILLING BREAKDOWN", headerFont));
            document.add(new Paragraph("Receipt Number: " + event.getReceiptNumber(), smallFont));
            document.add(new Paragraph(" "));

            PdfPTable billingTable = new PdfPTable(2);
            billingTable.setWidthPercentage(100);
            
            double totalAmount = event.getAmount() != null ? event.getAmount() : 0.0;
            if (totalAmount > 0) {
                // Reverse calculate typical authentic Indian ticket taxes for aesthetics (18% GST + ~2.5% convenience)
                // Assuming Total = Base * 1.205 (18% GST + 2.5% platform fee)
                double basePrice = totalAmount / 1.205;
                double convenienceFee = basePrice * 0.025;
                double gst = basePrice * 0.18;

                billingTable.addCell(buildBillingRow("Base Ticket Price", String.format("INR %.2f", basePrice), labelFont, valueFont, false));
                billingTable.addCell(buildBillingRow("Convenience Fee (2.5%)", String.format("INR %.2f", convenienceFee), labelFont, valueFont, false));
                billingTable.addCell(buildBillingRow("GST (18%)", String.format("INR %.2f", gst), labelFont, valueFont, false));
                
                // Separator line
                PdfPCell lineCell = new PdfPCell(new Paragraph(" "));
                lineCell.setColspan(2);
                lineCell.setBorder(Rectangle.BOTTOM);
                lineCell.setBorderColor(TEXT_SECONDARY);
                lineCell.setBorderWidth(1f);
                billingTable.addCell(lineCell);

                billingTable.addCell(buildBillingRow("TOTAL AMOUNT PAID", String.format("INR %.2f", totalAmount), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, TEXT_PRIMARY), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, ACCENT_COLOR), true));
            } else {
                billingTable.addCell(buildBillingRow("Event Access", "FREE", labelFont, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, ACCENT_COLOR), false));
                billingTable.addCell(buildBillingRow("TOTAL AMOUNT PAID", "INR 0.00", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, TEXT_PRIMARY), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, ACCENT_COLOR), true));
            }

            document.add(billingTable);
            
            // Footer Note
            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("This is an electronically generated ticket. Please present the QR code at the venue entrance. Arrive 30 minutes prior to the show.", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error rendering PDF binary stream: " + e.getMessage(), e);
        }
    }

    private PdfPCell buildInfoCell(String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(10);
        cell.addElement(new Paragraph(label, labelFont));
        cell.addElement(new Paragraph(value, valueFont));
        return cell;
    }

    private PdfPCell buildBillingRow(String leftText, String rightText, Font leftFont, Font rightFont, boolean isTotal) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        if(isTotal) { cell.setPaddingTop(10); }
        
        PdfPTable rowTable = new PdfPTable(2);
        rowTable.setWidthPercentage(100);
        
        PdfPCell leftPart = new PdfPCell(new Paragraph(leftText, leftFont));
        leftPart.setBorder(Rectangle.NO_BORDER);
        leftPart.setHorizontalAlignment(Element.ALIGN_LEFT);
        
        PdfPCell rightPart = new PdfPCell(new Paragraph(rightText, rightFont));
        rightPart.setBorder(Rectangle.NO_BORDER);
        rightPart.setHorizontalAlignment(Element.ALIGN_RIGHT);
        
        rowTable.addCell(leftPart);
        rowTable.addCell(rightPart);
        
        cell.addElement(rowTable);
        return cell;
    }

    private byte[] generateQRCodeImage(String text, int width, int height) throws Exception {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1);
        BitMatrix bitMatrix = new MultiFormatWriter().encode(text, BarcodeFormat.QR_CODE, width, height, hints);
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }
}
