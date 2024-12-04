package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.models.Device;

import java.time.LocalDateTime;

@Repository
public interface DeviceRepository extends R2dbcRepository<Device, Integer> {

    Mono<Device> findByActiveUserId(Integer activeUserId);

    @Query("SELECT * FROM devices WHERE :userId = ANY(users) LIMIT 1")
    Mono<Device> findFirstByUserIdInUsers(@Param("userId") Integer userId);

    Mono<Boolean> existsByDeviceId (Integer deviceId);

    @Modifying
    @Query("INSERT INTO devices (device_id, status, last_contact) VALUES (:deviceId, :status, :lastContact) ON CONFLICT (device_id) DO NOTHING")
    Mono<Void> saveNewDeviceIfNotExists(@Param("deviceId") Integer deviceId,
                                        @Param("status") String status,
                                        @Param("lastContact") LocalDateTime lastContact);
}