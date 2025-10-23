package ru.zan.Pulsometer.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("key_points") 
public class KeyPoint {

    @Id
    @Column("key_point_id")
    private Integer keyPointId;

    @Column("session_id")
    private Integer sessionId;

    @Column("start_measurement_id")
    private Integer startMeasurementId;

    @Column("end_measurement_id")
    private Integer endMeasurementId;

    private String name;
}
