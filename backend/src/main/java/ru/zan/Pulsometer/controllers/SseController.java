package ru.zan.Pulsometer.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import ru.zan.Pulsometer.services.SseBroadcastService;

@RestController
@CrossOrigin
@RequestMapping("/sse")
public class SseController {

    private final SseBroadcastService sseBroadcastService;

    public SseController(SseBroadcastService sseBroadcastService) {
        this.sseBroadcastService = sseBroadcastService;
    }

    @GetMapping(path = "/status", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamStatusUpdates(ServerHttpResponse response) {
        response.getHeaders().add("Access-Control-Allow-Origin", "*");
        Sinks.Many<String> clientSink = Sinks.many().multicast().onBackpressureBuffer();
        sseBroadcastService.registerClient("status", clientSink);
        return sseBroadcastService.getStatusMessage(clientSink)
                .doFinally(signalType -> sseBroadcastService.unregisterClient("status", clientSink));
    }

    @GetMapping(path = "/data", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamDataUpdates(ServerHttpResponse response) {
        response.getHeaders().add("Access-Control-Allow-Origin", "*");
        Sinks.Many<String> clientSink = Sinks.many().multicast().onBackpressureBuffer();
        sseBroadcastService.registerClient("data", clientSink);
        return sseBroadcastService.getDataMessage(clientSink)
                .doFinally(signalType -> sseBroadcastService.unregisterClient("data", clientSink));
    }
}
