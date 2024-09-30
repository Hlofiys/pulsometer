package ru.zan.Pulsometer.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("pulse_measurements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PulseMeasurement {

    @Id
    private Integer id;

    private Integer bpm;

    @Column(value = "user_id")
    private Integer userId;

    private LocalDateTime date;
}