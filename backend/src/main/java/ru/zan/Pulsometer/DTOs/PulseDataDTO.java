package ru.zan.Pulsometer.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PulseDataDTO {

    private Long id;

    private LocalDateTime date;

    private Integer bpm;
}
