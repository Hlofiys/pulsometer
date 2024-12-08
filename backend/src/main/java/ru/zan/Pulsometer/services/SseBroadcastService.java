package ru.zan.Pulsometer.services;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class SseBroadcastService {

    private final Sinks.Many<String> statusSink;
    private final Sinks.Many<String> dataSink;

    public SseBroadcastService() {
        this.statusSink = Sinks.many().multicast().onBackpressureBuffer();
        this.dataSink = Sinks.many().multicast().onBackpressureBuffer();
    }

    public void sendStatusMessage(String message) {
        statusSink.tryEmitNext(message);
    }

    public Flux<String> getStatusMessage() {
        return statusSink.asFlux();
    }

    public void sendDataMessage(String message) {
        dataSink.tryEmitNext(message);
    }

    public Flux<String> getDataMessage() {
        return dataSink.asFlux();
    }

}
