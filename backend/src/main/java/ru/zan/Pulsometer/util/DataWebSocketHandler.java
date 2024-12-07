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
public class DataWebSocketHandler implements WebSocketHandler {

    private final WebSocketBroadcastService broadcastService;

    @Autowired
    public DataWebSocketHandler(WebSocketBroadcastService broadcastService) {
        this.broadcastService = broadcastService;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {

        Flux<WebSocketMessage> pingMessages = Flux.interval(Duration.ofSeconds(15))
                .map(aLong -> session.textMessage("ping"));

        Flux<WebSocketMessage> dataMessages = broadcastService.getDataMessages()
                .map(session::textMessage)
                .doOnNext(msg -> System.out.println("Data message sent: " + msg.getPayloadAsText()));

        Flux<WebSocketMessage> messagesToSend = Flux.merge(pingMessages, dataMessages);

        return session.send(messagesToSend)
                .doOnTerminate(() -> System.out.println("WebSocket session terminated."))
                .doOnError(error -> System.err.println("Error occurred with WebSocket session /ws/data: " + error.getMessage())).then();
    }
}
