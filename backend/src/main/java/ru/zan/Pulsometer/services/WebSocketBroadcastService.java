package ru.zan.Pulsometer.services;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class WebSocketBroadcastService {

    private final Sinks.Many<String> statusSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<String> dataSink = Sinks.many().multicast().onBackpressureBuffer();

    public void sendStatusMessage(String message) {
        statusSink.tryEmitNext(message);
    }

    public void sendDataMessage(String message) {
        dataSink.tryEmitNext(message);
    }

    public Flux<String> getStatusMessages() {
        return statusSink.asFlux();
    }

    public Flux<String> getDataMessages() {
        return dataSink.asFlux();
    }
}
