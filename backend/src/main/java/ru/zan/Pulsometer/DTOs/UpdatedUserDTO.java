package ru.zan.Pulsometer.DTOs;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdatedUserDTO {

    @Schema(nullable = true)
    @Size(max = 255)
    private String fio;

    @Schema(nullable = true)
    @Size(max = 50)
    private String group;

    @Schema(nullable = true)
    @Min(value = 0)
    private Integer deviceId;
}