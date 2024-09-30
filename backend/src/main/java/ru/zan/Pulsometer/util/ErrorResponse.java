package ru.zan.Pulsometer.util;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ErrorResponse {

    private String message;

    private int status;
}
