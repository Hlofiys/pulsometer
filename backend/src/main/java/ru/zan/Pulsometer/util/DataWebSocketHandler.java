package ru.zan.Pulsometer.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.services.WebSocketBroadcastService;

@Component
public class DataWebSocketHandler implements WebSocketHandler {

    private final WebSocketBroadcastService broadcastService;

    @Autowired
    public DataWebSocketHandler(WebSocketBroadcastService broadcastService) {
        this.broadcastService = broadcastService;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        return session.send(
                broadcastService.getDataMessages()
                        .map(session::textMessage)
        ).then();
    }
}
