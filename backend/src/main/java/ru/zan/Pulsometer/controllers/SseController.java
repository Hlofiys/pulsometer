package ru.zan.Pulsometer.controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import ru.zan.Pulsometer.services.SseBroadcastService;

@RestController
@CrossOrigin
@RequestMapping("/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseBroadcastService sseBroadcastService;

    @GetMapping(path = "/status", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamStatusUpdates() {
        Sinks.Many<String> clientSink = Sinks.many().multicast().onBackpressureBuffer();
        sseBroadcastService.registerClient("status", clientSink);
        return sseBroadcastService.getStatusMessage(clientSink)
                .doFinally(signalType -> sseBroadcastService.unregisterClient("status", clientSink));
    }

    @GetMapping(path = "/data", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamDataUpdates() {
        Sinks.Many<String> clientSink = Sinks.many().multicast().onBackpressureBuffer();
        sseBroadcastService.registerClient("data", clientSink);
        return sseBroadcastService.getDataMessage(clientSink)
                .doFinally(signalType -> sseBroadcastService.unregisterClient("data", clientSink));
    }
}
