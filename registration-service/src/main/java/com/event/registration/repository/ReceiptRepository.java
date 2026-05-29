package com.event.registration.repository;

import com.event.registration.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    Optional<Receipt> findByRegistrationId(Long registrationId);

    // Bulk fetch to avoid N+1 query pattern.
    List<Receipt> findByRegistrationIdIn(List<Long> registrationIds);
}
