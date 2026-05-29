package com.event.event.repository;

import com.event.event.entity.Event;
import com.event.event.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByNameContainingIgnoreCase(String name);

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    long countByStatus(EventStatus status);

    Page<Event> findByOrganizerEmail(String organizerEmail, Pageable pageable);

    Page<Event> findByOrganizerEmailAndStatus(String organizerEmail, EventStatus status, Pageable pageable);

    long countByOrganizerEmail(String organizerEmail);

    long countByOrganizerEmailAndStatus(String organizerEmail, EventStatus status);

    @Query("""
            SELECT e FROM Event e
            WHERE (:name IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :name, '%')))
              AND (:venue IS NULL OR LOWER(e.venue.name) LIKE LOWER(CONCAT('%', :venue, '%')))
              AND (:minFee IS NULL OR e.fee >= :minFee)
              AND (:maxFee IS NULL OR e.fee <= :maxFee)
            """)
    Page<Event> searchByFilters(
            @Param("name") String name,
            @Param("venue") String venue,
            @Param("minFee") Double minFee,
            @Param("maxFee") Double maxFee,
            Pageable pageable
    );
}
