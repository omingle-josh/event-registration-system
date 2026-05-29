package com.event.registration.repository;

import com.event.registration.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionRef(String transactionRef);
    Optional<Payment> findByRegistrationId(Long registrationId);

    // Bulk fetch to avoid N+1 query pattern.
    List<Payment> findByRegistrationIdIn(List<Long> registrationIds);
}
