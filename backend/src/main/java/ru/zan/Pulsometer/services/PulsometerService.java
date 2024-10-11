package ru.zan.Pulsometer.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MqttDefaultFilePersistence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.DTOs.PulseDataDTO;
import ru.zan.Pulsometer.DTOs.StatusDataDTO;
import ru.zan.Pulsometer.DTOs.UpdatedUserDTO;
import ru.zan.Pulsometer.models.Device;
import ru.zan.Pulsometer.models.PulseMeasurement;
import ru.zan.Pulsometer.models.User;
import ru.zan.Pulsometer.repositories.DeviceRepository;
import ru.zan.Pulsometer.repositories.PulseMeasurementRepository;
import ru.zan.Pulsometer.repositories.UserRepository;
import ru.zan.Pulsometer.util.DeviceNotFoundException;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PulsometerService {
    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final PulseMeasurementRepository pulseMeasurementRepository;
    private final ObjectMapper objectMapper;
    private MqttAsyncClient mqttAsyncClient;
    private final String persistenceDir = "src/main/resources/persistence";

    @Autowired
    public PulsometerService(UserRepository userRepository,
                             DeviceRepository deviceRepository,
                             PulseMeasurementRepository pulseMeasurementRepository,
                             ObjectMapper objectMapper) throws MqttException {
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.pulseMeasurementRepository = pulseMeasurementRepository;
        this.objectMapper = objectMapper;

        MqttDefaultFilePersistence persistence = new MqttDefaultFilePersistence(persistenceDir);
        mqttAsyncClient = new MqttAsyncClient("tcp://home.hlofiys.xyz:1883", MqttAsyncClient.generateClientId(), persistence);

        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setConnectionTimeout(10);

        mqttAsyncClient.connect(options, null, new IMqttActionListener() {
            @Override
            public void onSuccess(IMqttToken asyncActionToken) {
                System.out.println("The connection was successful.");
                subscribeToTopic("device/status");
                subscribeToTopic("device/data");
            }

            @Override
            public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                System.out.println("Connection error: " + exception.getMessage());
            }
        });

        mqttAsyncClient.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {
                System.out.println("Connection lost: " + cause.getMessage());
                cause.printStackTrace();
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                if(topic.equalsIgnoreCase("device/status")) {
                    processMessageStatus(topic, message);
                }else if(topic.equalsIgnoreCase("device/data")) {
                    processMessageData(topic,message);
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {
            }
        });
    }

    private void subscribeToTopic(String topic) {
        try {
            mqttAsyncClient.subscribe(topic, 1);
            System.out.println("Successfully subscribed to topic: " + topic);
        } catch (MqttException e) {
            System.out.println("Failed to subscribe to topic: " + topic + " - " + e.getMessage());
        }
    }

    private void processMessageStatus(String topic, MqttMessage mqttMessage) {
        String payload = new String(mqttMessage.getPayload());
        System.out.println("Message arrived on topic " + topic + ": " + payload);

        StatusDataDTO statusData;
        try {
            statusData = objectMapper.readValue(payload, StatusDataDTO.class);
        } catch (IOException e) {
            System.err.println("Failed to parse message payload: " + e.getMessage());
            return;
        }

        deviceRepository.upsertDevice(statusData.getId(),
                        "ready",
                        LocalDateTime.now())
                .doOnSuccess(d -> System.out.println("Device upserted: " + statusData.getId()))
                .doOnError(e -> System.err.println("Error processing message: " + e.getMessage()))
                .subscribe();
    }

    private void processMessageData(String topic, MqttMessage mqttMessage) {
        String payload = new String(mqttMessage.getPayload());
        System.out.println("Message arrived on topic " + topic + ": " + payload);
        PulseMeasurement pulseMeasurement = new PulseMeasurement();
        PulseDataDTO pulseDataDTO;
        try {
            pulseDataDTO = objectMapper.readValue(payload, PulseDataDTO.class);
        } catch (JsonProcessingException e) {
            System.err.println("Failed to parse message payload: " + e.getMessage());
            return;
        }
        deviceRepository.findById(pulseDataDTO.getId())
                .flatMap(device -> {
                    device.setStatus("ready");
                    device.setLastContact(LocalDateTime.now());
                    pulseMeasurement.setUserId(device.getActiveUserId());
                    return deviceRepository.save(device);
                }).flatMap(savedDevice ->{
                    pulseMeasurement.setBpm(pulseDataDTO.getBpm());
                    pulseMeasurement.setDate(LocalDateTime.now());
                    return pulseMeasurementRepository.save(pulseMeasurement);
                }).subscribe();

    }

    public Mono<Boolean> publish (Integer deviceId, Integer userId) throws Exception {
        String topic = "device/switch/"+deviceId;
        String payload = (userId != null) ? "1" : "0";
        MqttMessage message = new MqttMessage(payload.getBytes());
        return Mono.create(sink -> {
            try {
                mqttAsyncClient.publish(topic, message, null, new IMqttActionListener() {
                    @Override
                    public void onSuccess(IMqttToken iMqttToken) {
                        if(userId != null){
                            deviceRepository.findById(deviceId)
                                    .switchIfEmpty(Mono.error(new DeviceNotFoundException("Device not found with ID: " + deviceId)))
                                    .flatMap(device -> {
                                        device.setStatus("measuring");
                                        device.setActiveUserId(userId);
                                        return deviceRepository.save(device)
                                                .then(Mono.just(true));
                                    })
                                    .subscribe(sink::success, sink::error);
                        }else {
                            deviceRepository.findById(deviceId)
                                    .switchIfEmpty(Mono.error(new DeviceNotFoundException("Device not found with ID: " + deviceId)))
                                    .flatMap(device -> {
                                        device.setStatus("ready");
                                        return deviceRepository.save(device)
                                                .then(Mono.just(true));
                                    })
                                    .subscribe(sink::success, sink::error);
                        }

                    }
                    @Override
                    public void onFailure(IMqttToken iMqttToken, Throwable throwable) {
                        System.out.println("Error when posting: " + throwable.getMessage());
                        sink.error(throwable);
                    }
                });
            } catch (MqttException e) {
                sink.error(e);
            }
        });
    }

    public Mono<Boolean> createUser (User user) {
        user.setId(null);
        return userRepository.save(user).hasElement();
    }

    public Mono<Boolean> deleteUser(Integer userId) {
        return userRepository.existsById(userId)
                .flatMap(exists -> {
                    if (exists) {
                        return userRepository.findById(userId)
                                .flatMap(user -> {
                                    return clearUsers(user.getDeviceId(), userId)
                                            .then(userRepository.deleteById(userId));
                                }).thenReturn(true);
                    } else {
                        return Mono.just(false);
                    }
                });
    }

    public Mono<Boolean> clearUsers (Integer deviceId,Integer userId) {
        return deviceRepository.findById(deviceId)
                .flatMap(device -> {
                    List<Integer> list = device.getUsers();
                    list.remove(userId);
                    device.setUsers(list);
                    return deviceRepository.save(device).thenReturn(true);
                });
    }

    public Mono<Boolean> updateUser(Integer userId, UpdatedUserDTO updatedUserDTO) {
        return userRepository.findById(userId)
                .flatMap(user -> {
                    Integer oldDeviceId = user.getDeviceId();

                    if (updatedUserDTO.getFio() != null) {
                        user.setFio(updatedUserDTO.getFio());
                    }
                    if (updatedUserDTO.getDeviceId() != null) {
                        user.setDeviceId(updatedUserDTO.getDeviceId());
                    }

                    return userRepository.save(user)
                            .flatMap(savedUser -> {
                                return deviceRepository.findById(oldDeviceId)
                                        .flatMap(oldDevice -> {
                                            List<Integer> list = oldDevice.getUsers();
                                            list.remove(userId);
                                            oldDevice.setUsers(list);
                                            return deviceRepository.save(oldDevice);
                                        }).thenReturn(savedUser);
                            })
                            .flatMap(savedUser -> {
                                return deviceRepository.findById(savedUser.getDeviceId())
                                        .flatMap(newDevice -> {
                                            List<Integer> list = newDevice.getUsers();
                                            if (!list.contains(userId)) {  // Проверка на наличие пользователя
                                                list.add(userId);  // Добавляем ID пользователя
                                            }
                                            newDevice.setUsers(list);
                                            return deviceRepository.save(newDevice);
                                        }).thenReturn(savedUser);
                            })
                            .map(savedUser -> true)
                            .defaultIfEmpty(false);
                });
    }

    public Mono<User> getUser(Integer userId) {
        return userRepository.findById(userId);
    }

    public Flux<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Flux<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    public Mono<Boolean> checkDeviceExists(Integer deviceId) {
        return deviceRepository.findById(deviceId)
                .hasElement();
    }

    public Flux<User> getDeviceUsers(Integer deviceId) {
        return deviceRepository.findById(deviceId)
                .flatMapMany(device -> {
                    List<Integer> users = device.getUsers();
                    if (users == null || users.isEmpty()) {
                        return Flux.empty();
                    }
                    return Flux.fromIterable(users)
                            .flatMap(userRepository::findById);
                });
    }

    public Flux<PulseMeasurement> getAllUserPulseMeasurements(Integer userId) {
        return userRepository.findById(userId)
                .flatMapMany(user -> {
                    List<Integer> pulseMeasurementIds = user.getPulseMeasurements();
                    if (pulseMeasurementIds == null || pulseMeasurementIds.isEmpty()) {
                        return Flux.empty();
                    }
                    return Flux.fromIterable(pulseMeasurementIds)
                            .flatMap(pulseMeasurementRepository::findById);
                })
                .switchIfEmpty(Flux.empty());
    }

    @Scheduled(fixedRate = 60000)
    public void updateDeviceStatus() {
        Instant twoMinutesAgo = Instant.now().minus(2, ChronoUnit.MINUTES);
        Flux<Device> devicesToUpdate = deviceRepository.findByLastContactBefore(twoMinutesAgo);
        devicesToUpdate
                .flatMap(device -> {
                    device.setStatus("off");
                    return deviceRepository.save(device);
                })
                .subscribe();
    }


    @PreDestroy
    public void clearPersistenceFiles() throws MqttException {
        if (mqttAsyncClient != null && mqttAsyncClient.isConnected()) {
            mqttAsyncClient.disconnect();
        }

        File folder = new File(persistenceDir);
        if (folder.exists() && folder.isDirectory()) {
            for (File file : folder.listFiles()) {
                if (file.isFile()) {
                    file.delete();
                }
            }
        }
    }

}
