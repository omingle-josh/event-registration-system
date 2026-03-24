package com.event.event.service;

import com.event.event.dto.EventRequest;
import com.event.event.dto.EventResponse;
import com.event.event.entity.Event;
import com.event.event.entity.EventStatus;
import com.event.event.exception.ResourceNotFoundException;
import com.event.event.exception.UnauthorizedException;
import com.event.event.repository.EventRepository;
import com.event.event.repository.VenueRepository;
import com.event.event.entity.Venue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    @Transactional
    public EventResponse createEvent(EventRequest request, String organizerEmail) {
        Event event = Event.builder()
                .name(request.getName())
                .description(request.getDescription())
                .date(request.getDate())
                .venue(resolveVenue(request.getVenue()))
                .fee(request.getFee())
                .capacity(request.getCapacity())
                .availableSeats(request.getCapacity()) // Default to completely full upon generation
                .status(EventStatus.OPEN)
                .organizerEmail(organizerEmail)
                .build();

        return mapToResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse updateEvent(Long eventId, EventRequest request, String organizerEmail) {
        Event event = getEvent(eventId);
        validateOwnership(event, organizerEmail);

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setVenue(resolveVenue(request.getVenue()));
        event.setFee(request.getFee());

        // Process capacity reallocation carefully
        int capacityDifference = request.getCapacity() - (event.getCapacity() != null ? event.getCapacity() : 0);
        int newAvailableSeats = (event.getAvailableSeats() != null ? event.getAvailableSeats() : 0) + capacityDifference;
        
        if (newAvailableSeats < 0) {
            throw new IllegalArgumentException("Cannot reduce capacity below the number of already registered attendees.");
        }
        
        event.setCapacity(request.getCapacity());
        event.setAvailableSeats(newAvailableSeats);

        // We explicitly skip entity save() and rely STRICTLY on Hibernate's Transactional Dirty-Checking 
        // flush to ensure absolutely no spurious INSERTs are constructed. Updates perform safely.
        return mapToResponse(event);
    }

    @Transactional
    public void deleteEvent(Long eventId, String organizerEmail) {
        Event event = getEvent(eventId);
        validateOwnership(event, organizerEmail);
        eventRepository.delete(event);
    }

    @Transactional
    public EventResponse changeStatus(Long eventId, EventStatus newStatus, String organizerEmail) {
        Event event = getEvent(eventId);
        validateOwnership(event, organizerEmail);
        event.setStatus(newStatus);
        return mapToResponse(event);
    }

    public List<EventResponse> getEvents(String name, Double minFee, Double maxFee, String venue) {
        return eventRepository.findAll().stream()
                .filter(event -> name == null || event.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(event -> venue == null || (event.getVenue() != null && event.getVenue().getName().toLowerCase().contains(venue.toLowerCase())))
                .filter(event -> minFee == null || event.getFee() >= minFee)
                .filter(event -> maxFee == null || event.getFee() <= maxFee)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(Long id) {
        return mapToResponse(getEvent(id));
    }

    private Event getEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    @Transactional
    public void reserveSeat(Long eventId) {
        Event event = getEvent(eventId);
        if (event.getAvailableSeats() <= 0) {
            throw new IllegalArgumentException("This event has no available seats remaining.");
        }
        event.setAvailableSeats(event.getAvailableSeats() - 1);
        eventRepository.save(event); // Force dirty check to trigger optimistic lock version constraint
    }

    @Transactional
    public void releaseSeat(Long eventId) {
        Event event = getEvent(eventId);
        event.setAvailableSeats(event.getAvailableSeats() + 1);
        eventRepository.save(event);
    }

    private void validateOwnership(Event event, String organizerEmail) {
        if (!event.getOrganizerEmail().equals(organizerEmail)) {
            throw new UnauthorizedException("You do not have permission to modify this event");
        }
    }

    private Venue resolveVenue(String venueName) {
        if (venueName == null || venueName.trim().isEmpty()) {
            return null;
        }
        return venueRepository.findByName(venueName)
                .orElseGet(() -> venueRepository.save(Venue.builder().name(venueName).build()));
    }

    private EventResponse mapToResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .date(event.getDate())
                .venue(event.getVenue() != null ? event.getVenue().getName() : null)
                .fee(event.getFee())
                .capacity(event.getCapacity())
                .availableSeats(event.getAvailableSeats())
                .status(event.getStatus())
                .organizerEmail(event.getOrganizerEmail())
                .build();
    }
}
