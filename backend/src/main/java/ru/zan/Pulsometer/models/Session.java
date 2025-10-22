package ru.zan.Pulsometer.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Session {

    @Id
    @Column(value = "session_id")
    private Integer sessionId;

    @Column(value = "user_id")
    private Integer userId;

    @NotNull
    @Column(value = "time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime time;

    @Column(value = "passed")
    private Long passed;

    @Column(value = "session_status")
    private String sessionStatus;

    @Column(value = "type_activity")
    private String typeActivity;

}
