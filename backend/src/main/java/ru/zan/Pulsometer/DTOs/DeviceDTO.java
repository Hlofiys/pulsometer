package ru.zan.Pulsometer.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DeviceDTO {

    private Integer deviceId;

    private String status;

    private Integer sessionId;

    private LocalDateTime lastContact;

    private List<Integer> users;
}
