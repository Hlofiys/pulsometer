package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import ru.zan.Pulsometer.models.Device;

@Repository
public interface DeviceRepository extends R2dbcRepository<Device, Long> {
}
