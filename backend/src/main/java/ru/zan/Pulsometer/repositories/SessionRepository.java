package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.models.Session;

import java.util.List;

@Repository
public interface SessionRepository extends R2dbcRepository<Session, Integer> {

    Flux<Session> findAllByUserId(int userId);

    Mono<Session> findFirstByUserIdAndSessionStatus(Integer userId, String sessionStatus);

    Mono<Boolean> existsByUserIdAndSessionStatus(Integer userId, String sessionStatus);

    @Modifying
    @Query("UPDATE sessions SET session_status = 'Closed' WHERE user_id IN (:userIds) AND session_status = 'Open'")
    Mono<Void> updateSessionStatusForUsers(@Param("userIds") List<Integer> userIds);

    @Query("SELECT EXISTS (SELECT 1 FROM sessions WHERE user_id IN (:userIds) AND session_status = 'Open')")
    Mono<Boolean> existsMultipleActiveSessionsByUserIds(@Param("userIds") List<Integer> userIds);

    @Query("SELECT s.session_id FROM sessions s WHERE s.user_id = :userId AND s.session_status = 'Open' ORDER BY s.time DESC LIMIT 1")
    Mono<Integer> findOpenSessionIdByUserId(@Param("userId") Integer userId);
}
