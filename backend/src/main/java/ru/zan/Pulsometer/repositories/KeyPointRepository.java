package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

import reactor.core.publisher.Flux;
import ru.zan.Pulsometer.models.KeyPoint;

@Repository
public interface KeyPointRepository extends R2dbcRepository <KeyPoint,Integer>{

    Flux<KeyPoint> findAllBySessionId(Integer sessionId);
}
