package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import ru.zan.Pulsometer.models.PulseMeasurement;

@Repository
public interface PulseMeasurementRepository extends R2dbcRepository<PulseMeasurement, Integer> {

}

