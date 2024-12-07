package ru.zan.Pulsometer.DTOs;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class DataWebSocketDTO {

    private Integer id;

    private Integer bpm;

    private Integer oxygen;

    private Integer sessionId;

    private String date;
}
