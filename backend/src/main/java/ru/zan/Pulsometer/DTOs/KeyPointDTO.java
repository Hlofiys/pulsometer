package ru.zan.Pulsometer.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeyPointDTO {
    private Integer startMeasurementId;
    private Integer endMeasurementId;
    private String name;
}
