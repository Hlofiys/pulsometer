package ru.zan.Pulsometer.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import ru.zan.Pulsometer.DTOs.DataWebSocketDTO;

import java.util.List;

@Service
public class WebSocketBroadcastService {

    private final Sinks.Many<String> statusSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<List<DataWebSocketDTO>> dataSink = Sinks.many().multicast().onBackpressureBuffer();

    public void sendStatusMessage(String message) {
        statusSink.tryEmitNext(message);
    }

    public void sendDataMessage(List<DataWebSocketDTO> measurements) {
        dataSink.tryEmitNext(measurements);
    }

    public Flux<String> getStatusMessages() {
        return statusSink.asFlux();
    }

    public Flux<List<DataWebSocketDTO>> getDataMessages() {
        return dataSink.asFlux();
    }
}
