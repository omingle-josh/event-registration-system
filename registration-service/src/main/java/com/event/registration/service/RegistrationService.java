package com.event.registration.service;

import com.event.registration.client.EventServiceClient;
import com.event.registration.dto.EmailEvent;
import com.event.registration.dto.EventResponse;
import com.event.registration.dto.OrganizerRegistrantDto;
import com.event.registration.dto.MyBookingResponse;
import com.event.registration.dto.RegistrationResponse;
import com.event.registration.entity.Registration;
import com.event.registration.entity.Receipt;
import com.event.registration.entity.RegistrationStatus;
import com.event.registration.entity.Payment;
import com.event.registration.entity.PaymentMethod;
import com.event.registration.entity.PaymentStatus;
import com.event.registration.exception.EventNotAvailableException;
import com.event.registration.exception.UnauthorizedException;
import com.event.registration.repository.ReceiptRepository;
import com.event.registration.repository.PaymentRepository;
import com.event.registration.repository.RegistrationRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.function.Function;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;
    private final EventServiceClient eventServiceClient;
    private final EmailService emailService;
    private final MeterRegistry meterRegistry;
    private final TicketSignatureService ticketSignatureService;
    private final QrCodeService qrCodeService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public RegistrationResponse register(Long eventId, String userEmail) {
        Timer.Sample sample = Timer.start(meterRegistry);
        EventResponse event;
        try {
            event = eventServiceClient.getEventById(eventId);
        } catch (FeignException.NotFound e) {
            throw new EventNotAvailableException("The specified event does not exist.");
        } catch (Exception e) {
            e.printStackTrace(); // Log exact trace natively
            throw new EventNotAvailableException("Networking error communicating with Event Service: " + e.getMessage());
        }

        Double fee = event.getFee() != null ? event.getFee() : 0.0;
        BigDecimal amount = BigDecimal.valueOf(fee);

        if (!"OPEN".equals(event.getStatus())) {
            throw new EventNotAvailableException("This event is not OPEN for registration.");
        }

        // Reject registrations for events whose date has already passed (to the minute).
        if (event.getDate() != null && event.getDate().isBefore(LocalDateTime.now())) {
            throw new EventNotAvailableException("This event has already taken place and is no longer accepting registrations.");
        }

        boolean requiresPayment = fee > 0;

        // For free events, reserve the seat and confirm immediately.
        if (!requiresPayment) {
            try {
                eventServiceClient.reserveSeat(eventId);
            } catch (FeignException.Conflict e) {
                throw new EventNotAvailableException("A race condition occurred and the last seat was just taken. Please try again.");
            } catch (FeignException.BadRequest e) {
                throw new EventNotAvailableException("This event has no available seats remaining.");
            } catch (Exception e) {
                throw new RuntimeException("Failed to reserve seat due to an internal error: " + e.getMessage());
            }

            Registration registration = Registration.builder()
                    .eventId(eventId)
                    .userEmail(userEmail)
                    .status(RegistrationStatus.CONFIRMED)
                    .build();

            Registration saved = registrationRepository.save(registration);

            Payment payment = Payment.builder()
                    .registrationId(saved.getId())
                    .amount(amount)
                    .paymentMethod(PaymentMethod.UNKNOWN)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .razorpayOrderId(null)
                    .transactionRef(null)
                    .paidAt(LocalDateTime.now())
                    .build();
            paymentRepository.save(payment);

            Receipt receipt = Receipt.builder()
                    .registrationId(saved.getId())
                    .receiptNumber(generateReceiptCode())
                    .build();
            Receipt savedReceipt = receiptRepository.save(receipt);

            EmailEvent emailEvent = EmailEvent.builder()
                    .userEmail(saved.getUserEmail())
                    .registrationId(saved.getId())
                    .eventName(event.getName())
                    .eventDate(event.getDate())
                    .eventVenue(event.getVenue())
                    .amount(fee)
                    .receiptNumber(savedReceipt.getReceiptNumber())
                    .transactionRef(payment.getTransactionRef())
                    .paymentMethod(payment.getPaymentMethod().name())
                    .build();
            emailService.sendBookingConfirmation(emailEvent);

            RegistrationResponse response = RegistrationResponse.builder()
                    .id(saved.getId())
                    .eventId(saved.getEventId())
                    .userEmail(saved.getUserEmail())
                    .status(saved.getStatus())
                    .receiptId(savedReceipt.getId())
                    .receiptNumber(savedReceipt.getReceiptNumber())
                    .razorpayOrderId(null)
                    .razorpayKeyId(null)
                    .amount(fee)
                    .currency(null)
                    .build();
            
            meterRegistry.counter("event_registrations_total").increment();
            sample.stop(meterRegistry.timer("registration_processing_seconds"));
            
            return response;
        }

        // Paid events: create a PENDING registration; seat is reserved only when payment is captured.
        Registration registration = Registration.builder()
                .eventId(eventId)
                .userEmail(userEmail)
                .status(RegistrationStatus.PENDING)
                .build();

        Registration saved = registrationRepository.save(registration);

        String razorpayOrderId = null;
        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();

            // Razorpay API requires amounts strictly formatted in paise (fiat * 100)
            int amountInPaise = amount.multiply(new BigDecimal("100")).intValue();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + saved.getId());

            // Extremely important mapping payload returned automatically on Webhook callback
            JSONObject notes = new JSONObject();
            notes.put("registration_id", saved.getId());
            orderRequest.put("notes", notes);

            Order order = razorpayClient.orders.create(orderRequest);
            razorpayOrderId = order.get("id");
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to generate Razorpay Order: " + e.getMessage());
        }

        Payment payment = Payment.builder()
                .registrationId(saved.getId())
                .amount(amount)
                .paymentMethod(PaymentMethod.RAZORPAY)
                .paymentStatus(PaymentStatus.PENDING)
                .razorpayOrderId(razorpayOrderId)
                .transactionRef(null)
                .paidAt(requiresPayment ? null : LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        RegistrationResponse response = RegistrationResponse.builder()
                .id(saved.getId())
                .eventId(saved.getEventId())
                .userEmail(saved.getUserEmail())
                .status(saved.getStatus()) // PENDING until Razorpay webhook confirms
                .receiptId(null)
                .receiptNumber(null)
                .razorpayOrderId(razorpayOrderId)
                .razorpayKeyId(razorpayKeyId)
                .amount(fee)
                .currency("INR")
                .build();
                
        meterRegistry.counter("event_registrations_total").increment();
        sample.stop(meterRegistry.timer("registration_processing_seconds"));
        
        return response;
    }

    @Transactional(readOnly = true)
    public List<MyBookingResponse> getMyBookings(String userEmail) {
        List<Registration> registrations =
                registrationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        return mapToMyBookingResponses(registrations);
    }

    @Transactional(readOnly = true)
    public List<MyBookingResponse> getMyConfirmedBookings(String userEmail) {
        List<Registration> registrations =
                registrationRepository.findByUserEmailAndStatusOrderByCreatedAtDesc(userEmail, RegistrationStatus.CONFIRMED);
        return mapToMyBookingResponses(registrations);
    }

    @Transactional(readOnly = true)
    public Page<com.event.registration.dto.AdminTransactionDto> getAdminTransactions(Pageable pageable) {
        Page<Registration> page = registrationRepository.findAll(pageable);
        List<Registration> registrations = page.getContent();

        if (registrations.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Long> registrationIds = registrations.stream().map(Registration::getId).toList();
        List<Long> eventIds = registrations.stream().map(Registration::getEventId).distinct().toList();

        Map<Long, Receipt> receiptByRegistrationId = receiptRepository.findByRegistrationIdIn(registrationIds).stream()
                .collect(Collectors.toMap(Receipt::getRegistrationId, Function.identity(), (a, b) -> a));

        Map<Long, Payment> paymentByRegistrationId = paymentRepository.findByRegistrationIdIn(registrationIds).stream()
                .collect(Collectors.toMap(Payment::getRegistrationId, Function.identity(), (a, b) -> a));

        final Map<Long, EventResponse> eventById;
        {
            Map<Long, EventResponse> tmp;
            try {
                // Bulk fetch to avoid 10-50 sequential network round-trips per page.
                String ids = eventIds.stream().map(String::valueOf).collect(Collectors.joining(","));
                List<EventResponse> events = eventServiceClient.getEventsBulk(ids);
                tmp = events.stream()
                        .filter(e -> e.getId() != null)
                        .collect(Collectors.toMap(EventResponse::getId, Function.identity(), (a, b) -> a));
            } catch (Exception e) {
                tmp = Map.of();
            }
            eventById = tmp;
        }

        List<com.event.registration.dto.AdminTransactionDto> items = registrations.stream()
                .map(reg -> {
                    Receipt receipt = receiptByRegistrationId.get(reg.getId());
                    Payment payment = paymentByRegistrationId.get(reg.getId());
                    EventResponse event = eventById.get(reg.getEventId());

                    return com.event.registration.dto.AdminTransactionDto.builder()
                            .registrationId(reg.getId())
                            .eventId(reg.getEventId())
                            .eventName(event != null ? event.getName() : null)
                            .eventDate(event != null ? event.getDate() : null)
                            .eventVenue(event != null ? event.getVenue() : null)
                            .userEmail(reg.getUserEmail())
                            .registrationStatus(reg.getStatus())
                            .paymentStatus(payment != null ? payment.getPaymentStatus() : null)
                            .receiptId(receipt != null ? receipt.getId() : null)
                            .receiptNumber(receipt != null ? receipt.getReceiptNumber() : null)
                            .createdAt(reg.getCreatedAt())
                            .build();
                })
                .toList();

        return new PageImpl<>(items, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<OrganizerRegistrantDto> getOrganizerEventRegistrants(
            String organizerEmail,
            Long eventId,
            RegistrationStatus registrationStatus,
            Pageable pageable
    ) {
        EventResponse event;
        try {
            event = eventServiceClient.getEventById(eventId);
        } catch (FeignException.NotFound e) {
            throw new EventNotAvailableException("The specified event does not exist.");
        }

        if (event.getOrganizerEmail() == null || !event.getOrganizerEmail().equals(organizerEmail)) {
            throw new UnauthorizedException("You do not have permission to view registrants for this event.");
        }

        Page<Registration> page;
        if (registrationStatus == null) {
            page = registrationRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable);
        } else {
            page = registrationRepository.findByEventIdAndStatusOrderByCreatedAtDesc(eventId, registrationStatus, pageable);
        }

        List<Registration> registrations = page.getContent();
        if (registrations.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Long> registrationIds = registrations.stream().map(Registration::getId).toList();

        Map<Long, Receipt> receiptByRegistrationId = receiptRepository.findByRegistrationIdIn(registrationIds).stream()
                .collect(Collectors.toMap(Receipt::getRegistrationId, Function.identity(), (a, b) -> a));

        Map<Long, Payment> paymentByRegistrationId = paymentRepository.findByRegistrationIdIn(registrationIds).stream()
                .collect(Collectors.toMap(Payment::getRegistrationId, Function.identity(), (a, b) -> a));

        List<OrganizerRegistrantDto> items = registrations.stream()
                .map(reg -> {
                    Receipt receipt = receiptByRegistrationId.get(reg.getId());
                    Payment payment = paymentByRegistrationId.get(reg.getId());

                    return OrganizerRegistrantDto.builder()
                            .registrationId(reg.getId())
                            .eventId(reg.getEventId())
                            .userEmail(reg.getUserEmail())
                            .registrationStatus(reg.getStatus())
                            .paymentStatus(payment != null ? payment.getPaymentStatus() : null)
                            .receiptId(receipt != null ? receipt.getId() : null)
                            .receiptNumber(receipt != null ? receipt.getReceiptNumber() : null)
                            .createdAt(reg.getCreatedAt())
                            .build();
                })
                .toList();

        return new PageImpl<>(items, pageable, page.getTotalElements());
    }

    private List<MyBookingResponse> mapToMyBookingResponses(List<Registration> registrations) {
        if (registrations.isEmpty()) return List.of();

        List<Long> registrationIds = registrations.stream().map(Registration::getId).toList();

        Map<Long, Receipt> receiptByRegistrationId = receiptRepository.findByRegistrationIdIn(registrationIds).stream()
                .collect(Collectors.toMap(Receipt::getRegistrationId, Function.identity(), (a, b) -> a));

        Map<Long, Payment> paymentByRegistrationId = paymentRepository.findByRegistrationIdIn(registrationIds).stream()
                .collect(Collectors.toMap(Payment::getRegistrationId, Function.identity(), (a, b) -> a));

        return registrations.stream()
                .map(reg -> {
                    Receipt receipt = receiptByRegistrationId.get(reg.getId());
                    Payment payment = paymentByRegistrationId.get(reg.getId());

                    String qrCode = null;
                    if (reg.getStatus() == RegistrationStatus.CONFIRMED) {
                        String signature = ticketSignatureService.generateSignature(reg.getId(), reg.getUserEmail());
                        String payload = reg.getId() + ":" + signature;
                        qrCode = qrCodeService.generateQrCodeBase64(payload, 250, 250);
                    }

                    return MyBookingResponse.builder()
                            .id(reg.getId())
                            .eventId(reg.getEventId())
                            .status(reg.getStatus())
                            .paymentStatus(payment != null ? payment.getPaymentStatus() : null)
                            .receiptId(receipt != null ? receipt.getId() : null)
                            .receiptNumber(receipt != null ? receipt.getReceiptNumber() : null)
                            .qrCode(qrCode)
                            .createdAt(reg.getCreatedAt())
                            .build();
                })
                .toList();
    }

    private String generateReceiptCode() {
        return "REC-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
