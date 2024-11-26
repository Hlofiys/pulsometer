package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.models.Session;

@Repository
public interface SessionRepository extends R2dbcRepository<Session, Integer> {

    Flux<Session> findAllByUserId(int userId);

    Mono<Session> findFirstByUserIdOrderByTimeDesc(int userId);
}
