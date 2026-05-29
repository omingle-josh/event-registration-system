package com.event.event.controller;

import com.event.event.entity.ChatMessage;
import com.event.event.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/{eventId}/chat/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long eventId) {
        List<ChatMessage> history = chatMessageRepository.findByEventIdOrderByTimestampAsc(eventId);
        return ResponseEntity.ok(history);
    }
}
