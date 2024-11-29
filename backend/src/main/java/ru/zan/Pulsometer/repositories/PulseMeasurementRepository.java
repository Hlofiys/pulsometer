package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.models.PulseMeasurement;

import java.time.LocalDateTime;

@Repository
public interface PulseMeasurementRepository extends R2dbcRepository<PulseMeasurement, Integer> {

    Flux<PulseMeasurement> findAllBySessionId (Integer sessionId);

    Mono<Boolean> existsByDate (LocalDateTime date);
}

