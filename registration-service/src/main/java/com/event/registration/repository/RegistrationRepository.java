package com.event.registration.repository;

import com.event.registration.entity.Registration;
import com.event.registration.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    List<Registration> findByUserEmailAndStatusOrderByCreatedAtDesc(
            String userEmail,
            RegistrationStatus status
    );

    Page<Registration> findByEventIdOrderByCreatedAtDesc(Long eventId, Pageable pageable);

    Page<Registration> findByEventIdAndStatusOrderByCreatedAtDesc(Long eventId, RegistrationStatus status, Pageable pageable);
}
