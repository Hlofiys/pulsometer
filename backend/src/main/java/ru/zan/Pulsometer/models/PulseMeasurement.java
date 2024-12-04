package ru.zan.Pulsometer.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Size;
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
    @Column(value = "measurement_id")
    private Integer measurementId;

    private Integer bpm;

    @Size(min = 1,max = 50)
    private Integer oxygen;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime date;

    @Column(value = "session_id")
    private Integer sessionId;
}