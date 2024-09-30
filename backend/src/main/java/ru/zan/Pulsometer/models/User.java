package ru.zan.Pulsometer.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.List;

@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private Integer id;

    private String fio;

    @Column(value = "device_id")
    private Integer deviceId;

    @Column(value = "pulse_measurements")
    private List<Integer> pulseMeasurements;
}
