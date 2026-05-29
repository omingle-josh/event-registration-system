package com.event.event.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private String senderEmail;

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false, length = 1000)
    private String messageContent;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
