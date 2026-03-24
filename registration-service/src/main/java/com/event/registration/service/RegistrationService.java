package com.event.registration.service;

import com.event.registration.client.EventServiceClient;
import com.event.registration.dto.EventResponse;
import com.event.registration.dto.RegistrationResponse;
import com.event.registration.entity.Registration;
import com.event.registration.entity.RegistrationStatus;
import com.event.registration.entity.Payment;
import com.event.registration.entity.PaymentMethod;
import com.event.registration.entity.PaymentStatus;
import com.event.registration.exception.EventNotAvailableException;
import com.event.registration.repository.PaymentRepository;
import com.event.registration.repository.RegistrationRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final PaymentRepository paymentRepository;
    private final EventServiceClient eventServiceClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public RegistrationResponse register(Long eventId, String userEmail) {
        EventResponse event;
        try {
            event = eventServiceClient.getEventById(eventId);
        } catch (FeignException.NotFound e) {
            throw new EventNotAvailableException("The specified event does not exist.");
        } catch (Exception e) {
            e.printStackTrace(); // Log exact trace natively
            throw new EventNotAvailableException("Networking error communicating with Event Service: " + e.getMessage());
        }

        if (!"OPEN".equals(event.getStatus())) {
            throw new EventNotAvailableException("This event is not OPEN for registration.");
        }
        
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
                .status(RegistrationStatus.PENDING)
                .build();

        Double fee = event.getFee() != null ? event.getFee() : 0.0;
        BigDecimal amount = BigDecimal.valueOf(fee);

        Registration saved = registrationRepository.save(registration);

        String razorpayOrderId = null;
        if (fee > 0) {
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
        }

        Payment payment = Payment.builder()
                .registrationId(saved.getId())
                .amount(amount)
                .paymentMethod(fee > 0 ? PaymentMethod.RAZORPAY : PaymentMethod.UNKNOWN)
                .paymentStatus(PaymentStatus.PENDING)
                .razorpayOrderId(razorpayOrderId)
                .transactionRef(null)
                .build();
        paymentRepository.save(payment);

        return RegistrationResponse.builder()
                .id(saved.getId())
                .eventId(saved.getEventId())
                .userEmail(saved.getUserEmail())
                .status(saved.getStatus())
                .razorpayOrderId(razorpayOrderId)
                .razorpayKeyId(fee > 0 ? razorpayKeyId : null)
                .amount(fee)
                .currency(fee > 0 ? "INR" : null)
                .build();
    }
}
