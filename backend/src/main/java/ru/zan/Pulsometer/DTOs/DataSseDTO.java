package ru.zan.Pulsometer.DTOs;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class DataSseDTO {

    private Integer id;

    private Integer bpm;

    private Integer oxygen;

    private Integer sessionId;

    private String date;
}
