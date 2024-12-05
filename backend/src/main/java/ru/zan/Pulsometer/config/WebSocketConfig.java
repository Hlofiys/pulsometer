package ru.zan.Pulsometer.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import ru.zan.Pulsometer.util.DataWebSocketHandler;
import ru.zan.Pulsometer.util.StatusWebSocketHandler;

import java.util.Map;

@Configuration
@EnableWebFlux
public class WebSocketConfig implements WebFluxConfigurer {

    private final StatusWebSocketHandler statusWebSocketHandler;
    private final DataWebSocketHandler dataWebSocketHandler;

    @Autowired
    public WebSocketConfig(StatusWebSocketHandler statusWebSocketHandler, DataWebSocketHandler dataWebSocketHandler) {
        this.statusWebSocketHandler = statusWebSocketHandler;
        this.dataWebSocketHandler = dataWebSocketHandler;
    }

    @Bean
    public HandlerMapping handlerMapping(){
        Map<String, WebSocketHandler> handlerMap = Map.of(
                "/ws/status", statusWebSocketHandler,
                "/ws/data", dataWebSocketHandler
        );
        return new SimpleUrlHandlerMapping(handlerMap, 1);
    }
}
