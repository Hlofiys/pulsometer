package ru.zan.Pulsometer.models;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @Column(value = "session_id")
    private Integer sessionId;

    @Column(value = "user_id")
    private Integer userId;

    @NotNull
    @Column(value = "time")
    private LocalDateTime time;

    @Column(value = "passed")
    private Long passed;

    @Column(value = "session_status")
    private String sessionStatus;
}
