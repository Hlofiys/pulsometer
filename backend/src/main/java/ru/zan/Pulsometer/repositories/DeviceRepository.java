package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.models.Device;

@Repository
public interface DeviceRepository extends R2dbcRepository<Device, Integer> {

    Mono<Device> findByActiveUserId(Integer activeUserId);

    @Query("SELECT * FROM devices WHERE :userId = ANY(users) LIMIT 1")
    Mono<Device> findFirstByUserIdInUsers(@Param("userId") Integer userId);
}