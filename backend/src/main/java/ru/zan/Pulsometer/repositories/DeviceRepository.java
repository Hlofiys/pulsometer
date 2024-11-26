package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.models.Device;

import java.time.Instant;
import java.time.LocalDateTime;

@Repository
public interface DeviceRepository extends R2dbcRepository<Device, Integer> {

    @Query("INSERT INTO devices (device_id, status, last_contact) " +
            "VALUES (:id, :status, :lastContact) " +
            "ON CONFLICT (device_id) DO UPDATE " +
            "SET status = :status, last_contact = :lastContact")
    Mono<Void> upsertDevice(@Param("id") Integer id,
                            @Param("status") String status,
                            @Param("lastContact") LocalDateTime lastContact);

    Flux<Device> findByLastContactBefore(Instant timestamp);

    Mono<Device> findByActiveUserId(Integer activeUserId);
}