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
    private final Sinks.Many<String> dataSink = Sinks.many().multicast().onBackpressureBuffer();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendStatusMessage(String message) {
        statusSink.tryEmitNext(message);
    }

    public void sendDataMessage(List<DataWebSocketDTO> measurements) {
        try {
            String message = objectMapper.writeValueAsString(measurements);
            dataSink.tryEmitNext(message);
        } catch (JsonProcessingException e) {
            System.err.println("Failed to serialize measurements: " + e.getMessage());
        }
    }

    public Flux<String> getStatusMessages() {
        return statusSink.asFlux();
    }

    public Flux<String> getDataMessages() {
        return dataSink.asFlux();
    }
}
