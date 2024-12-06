package ru.zan.Pulsometer.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.services.WebSocketBroadcastService;

import java.time.Duration;

@Component
public class StatusWebSocketHandler implements WebSocketHandler {

    private final WebSocketBroadcastService broadcastService;

    @Autowired
    public StatusWebSocketHandler(WebSocketBroadcastService broadcastService) {
        this.broadcastService = broadcastService;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {

        Flux<WebSocketMessage> pingMessages = Flux.interval(Duration.ofSeconds(15))
                .map(aLong -> session.textMessage("ping"));

        Flux<WebSocketMessage> messagesToSend = Flux.merge(
                pingMessages,
                broadcastService.getStatusMessages().map(session::textMessage)
        );

        return session.send(messagesToSend)
                .doOnError(error -> System.err.println("Error occurred with WebSocket session /ws/status: " + error.getMessage()))
                .then();
    }
}