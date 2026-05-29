package com.event.event.config;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import jakarta.annotation.PreDestroy;

@Component
@RequiredArgsConstructor
@Slf4j
public class SocketIOServerRunner implements CommandLineRunner {

    private final SocketIOServer socketIOServer;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting Socket.IO Server...");
        socketIOServer.start();
        log.info("Socket.IO Server started on port {}", socketIOServer.getConfiguration().getPort());
    }

    @PreDestroy
    public void stopServer() {
        log.info("Stopping Socket.IO Server...");
        socketIOServer.stop();
        log.info("Socket.IO Server stopped.");
    }
}
