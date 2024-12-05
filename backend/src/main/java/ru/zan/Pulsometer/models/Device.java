package ru.zan.Pulsometer.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.List;

@Table("devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Device {

    @Id
    @Column(value = "device_id")
    private Integer deviceId;

    @Size(min = 1, max = 50)
    @NotNull
    private String status;

    @Column(value = "active_user_id")
    private Integer activeUserId;

    @Column(value = "last_contact")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastContact;

    private List<Integer> users;
}
