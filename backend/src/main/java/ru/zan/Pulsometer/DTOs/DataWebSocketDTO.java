package ru.zan.Pulsometer.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DataWebSocketDTO {

    private Integer id;

    private Integer bpm;

    private Integer oxygen;

    private Integer sessionId;

    private LocalDateTime date;
}
