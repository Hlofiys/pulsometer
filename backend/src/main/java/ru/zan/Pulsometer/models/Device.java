package ru.zan.Pulsometer.models;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Device {

    @Id
    private Long id;

    @Size(min = 1, max = 50)
    @NotNull
    private String status;

    @Column(value = "active_user_id")
    private Long activeUserId;

    @Column(value = "last_contact")
    private LocalDateTime lastContact;

    private int[] users;
}
