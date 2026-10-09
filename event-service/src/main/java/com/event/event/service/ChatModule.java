package com.event.event.service;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.event.event.entity.ChatMessage;
import com.event.event.repository.ChatMessageRepository;
import com.event.event.security.JwtUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatModule {

    private final SocketIOServer socketIOServer;
    private final ChatMessageRepository chatMessageRepository;
    private final JwtUtil jwtUtil;

    @OnConnect
    public void onConnect(SocketIOClient client) {
        log.info("Client connected: {}", client.getSessionId());
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        log.info("Client disconnected: {}", client.getSessionId());
    }

    @OnEvent("join_room")
    public void onJoinRoom(SocketIOClient client, JoinRoomRequest request) {
        String room = request.getEventId().toString();
        client.joinRoom(room);
        log.info("Client {} joined room {}", client.getSessionId(), room);
    }

    @OnEvent("send_message")
    public void onSendMessage(SocketIOClient client, SendMessageRequest request) {
        String token = client.getHandshakeData().getSingleUrlParam("token");
        String senderEmail = jwtUtil.extractEmail(token);
        // We'll extract a naive generic name if no name is provided, or from token if possible.
        // For now, let's use the first part of email.
        String senderName = senderEmail.split("@")[0];

        ChatMessage message = ChatMessage.builder()
                .eventId(request.getEventId())
                .senderEmail(senderEmail)
                .senderName(senderName)
                .messageContent(request.getMessageContent())
                .build();

        // Save to DB
        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Broadcast to room explicitly
        String room = request.getEventId().toString();
        for (SocketIOClient c : socketIOServer.getRoomOperations(room).getClients()) {
            if (!c.getSessionId().equals(client.getSessionId())) {
                c.sendEvent("receive_message", savedMessage);
            }
        }
        
        // Explicitly send back to the sender
        client.sendEvent("receive_message", savedMessage);
        
        log.info("Message sent to room {}: {}", room, savedMessage.getMessageContent());
    }

    @Data
    public static class JoinRoomRequest {
        private Long eventId;
    }

    @Data
    public static class SendMessageRequest {
        private Long eventId;
        private String messageContent;
    }
}
