package ru.zan.Pulsometer.DTOs;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {

    @NotEmpty
    @Size(max = 255)
    private String fio;

    @NotEmpty
    @Size(max = 50)
    private String group;

    @NotNull
    @Min(value = 0)
    private Integer deviceId;
}
