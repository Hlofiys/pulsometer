package ru.zan.Pulsometer.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
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
        return sseBroadcastService.getStatusMessage();
    }

    @GetMapping(path = "/data", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamDataUpdates(ServerHttpResponse response) {
        response.getHeaders().add("Access-Control-Allow-Origin", "*");
        return sseBroadcastService.getDataMessage();
    }
}
