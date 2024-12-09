package ru.zan.Pulsometer.services;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SseBroadcastService {

    private final List<Sinks.Many<String>> statusClients = new CopyOnWriteArrayList<>();
    private final List<Sinks.Many<String>> dataClients = new CopyOnWriteArrayList<>();

    public void registerClient(String channel, Sinks.Many<String> clientSink) {
        if ("status".equals(channel)) {
            statusClients.add(clientSink);
        } else if ("data".equals(channel)) {
            dataClients.add(clientSink);
        }
    }

    public void unregisterClient(String channel, Sinks.Many<String> clientSink) {
        if ("status".equals(channel)) {
            statusClients.remove(clientSink);
        } else if ("data".equals(channel)) {
            dataClients.remove(clientSink);
        }
    }

    public void sendStatusMessage(String message) {
        for (Sinks.Many<String> client : statusClients) {
            client.tryEmitNext(message);
        }
    }

    public void sendDataMessage(String message) {
        for (Sinks.Many<String> client : dataClients) {
            client.tryEmitNext(message);
        }
    }

    public Flux<String> getStatusMessage(Sinks.Many<String> clientSink) {
        return clientSink.asFlux();
    }

    public Flux<String> getDataMessage(Sinks.Many<String> clientSink) {
        return clientSink.asFlux();
    }

}
