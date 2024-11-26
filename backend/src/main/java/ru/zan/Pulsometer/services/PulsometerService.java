package ru.zan.Pulsometer.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MqttDefaultFilePersistence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.DTOs.MqttPayload;
import ru.zan.Pulsometer.DTOs.PulseDataDTO;
import ru.zan.Pulsometer.DTOs.StatusDataDTO;
import ru.zan.Pulsometer.DTOs.UpdatedUserDTO;
import ru.zan.Pulsometer.models.Device;
import ru.zan.Pulsometer.models.PulseMeasurement;
import ru.zan.Pulsometer.models.Session;
import ru.zan.Pulsometer.models.User;
import ru.zan.Pulsometer.repositories.DeviceRepository;
import ru.zan.Pulsometer.repositories.PulseMeasurementRepository;
import ru.zan.Pulsometer.repositories.SessionRepository;
import ru.zan.Pulsometer.repositories.UserRepository;
import ru.zan.Pulsometer.util.DeviceNotFoundException;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class PulsometerService {
    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final PulseMeasurementRepository pulseMeasurementRepository;
    private final SessionRepository sessionRepository;
    private final ObjectMapper objectMapper;
    private final MqttAsyncClient mqttAsyncClient;
    private final String persistenceDir = "src/main/resources/persistence";


    @Autowired
    public PulsometerService(UserRepository userRepository,
                             DeviceRepository deviceRepository,
                             PulseMeasurementRepository pulseMeasurementRepository, SessionRepository sessionRepository,
                             ObjectMapper objectMapper) throws MqttException {
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.pulseMeasurementRepository = pulseMeasurementRepository;
        this.sessionRepository = sessionRepository;
        this.objectMapper = objectMapper;

        MqttDefaultFilePersistence persistence = new MqttDefaultFilePersistence(persistenceDir);
        mqttAsyncClient = new MqttAsyncClient("tcp://broker.hivemq.com:1883", MqttAsyncClient.generateClientId(), persistence);

        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);

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
            }

            @Override
            public void messageArrived(String topic, MqttMessage message){
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
                    return deviceRepository.save(device);
                }).flatMap(savedDevice ->{
                    pulseMeasurement.setBpm(pulseDataDTO.getBpm());
                    pulseMeasurement.setDate(LocalDateTime.now());
                    pulseMeasurement.setSessionId(pulseDataDTO.getSessionId());
                    pulseMeasurement.setOxygen(pulseDataDTO.getOxygen());
                    return sessionRepository.findById(pulseDataDTO.getSessionId())
                            .flatMap(receivedSession ->{
                                LocalDateTime now = LocalDateTime.now();
                                double timeDifferent = Duration.between(receivedSession.getTime(), now).toMillis()/60000.0;
                                receivedSession.setPassed(receivedSession.getPassed() + timeDifferent);
                                receivedSession.setTime(now);
                                return sessionRepository.save(receivedSession);
                            }).then(Mono.just(pulseMeasurement));
                })
                .flatMap(pulseMeasurementRepository::save)
                .subscribe();
    }

    private Mono<String> createActivateMessage(Integer userId) {
        Session session = new Session();
        session.setUserId(userId);
        session.setTime(LocalDateTime.now());

        return sessionRepository.save(session)
                .flatMap(savedSession -> {
                    String isActivateValue ="1";
                    MqttPayload payloadObject = createMqttPayload(isActivateValue,savedSession.getSessionId());
                    ObjectMapper objectMapper = new ObjectMapper();
                    try {
                        String payload = objectMapper.writeValueAsString(payloadObject);
                        System.out.println("Активация создание сообщения:"+payload);
                        return Mono.just(payload);
                    } catch (JsonProcessingException e) {
                        return Mono.error(new RuntimeException("Error serializing payload", e));
                    }
                });
    }

    private MqttPayload createMqttPayload(String isActivateValue, Integer sessionId) {
        return new MqttPayload(isActivateValue, sessionId);
    }

    public Mono<Boolean> publishActivate (Integer deviceId, Integer userId){
        String topic = "device/switch/" + deviceId;
        return createActivateMessage(userId)
                .flatMap(payload->{
                    MqttMessage message = new MqttMessage(payload.getBytes());
                    return Mono.create(sink -> {
                        try {
                            mqttAsyncClient.publish(topic, message, null, new IMqttActionListener() {
                                @Override
                                public void onSuccess(IMqttToken iMqttToken) {
                                    deviceRepository.findById(deviceId)
                                            .switchIfEmpty(Mono.error(new DeviceNotFoundException("Device not found with ID: " + deviceId)))
                                            .flatMap(device -> {
                                                device.setStatus("measuring");
                                                device.setActiveUserId(userId);
                                                return deviceRepository.save(device)
                                                        .then(Mono.just(true));
                                            })
                                            .subscribe(sink::success, sink::error);
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
                });
    }

    private Mono<String> createDeactivateMessage(Integer userId) {
        return sessionRepository.findFirstByUserIdOrderByTimeDesc(userId)
                .flatMap(session -> {
                    String isActivateValue ="0";
                    MqttPayload payloadObject = createMqttPayload(isActivateValue,session.getSessionId());
                    ObjectMapper objectMapper = new ObjectMapper();
                    try {
                        String payload = objectMapper.writeValueAsString(payloadObject);
                        System.out.println("Деактивация создание сообщения:"+payload);
                        return Mono.just(payload);
                    } catch (JsonProcessingException e) {
                        return Mono.error(new RuntimeException("Error serializing payload", e));
                    }
                });
    }

    public Mono<Boolean> publishDeactivate (Integer userId){
        return deviceRepository.findByActiveUserId(userId)
                .flatMap(device -> {
                    String topic = "device/switch/" + device.getDeviceId();
                    System.out.println("Отправка деактивация:"+topic);
                    return createDeactivateMessage(userId)
                            .flatMap(payload->{
                                MqttMessage message = new MqttMessage(payload.getBytes());
                                return Mono.create(sink -> {
                                    try {
                                        mqttAsyncClient.publish(topic, message, null, new IMqttActionListener() {
                                            @Override
                                            public void onSuccess(IMqttToken iMqttToken) {
                                                deviceRepository.findById(device.getDeviceId())
                                                        .switchIfEmpty(Mono.error(new DeviceNotFoundException("Device not found with ID: " + device.getDeviceId())))
                                                        .flatMap(device -> {
                                                            device.setStatus("ready");
                                                            return deviceRepository.save(device)
                                                                    .then(Mono.just(true));
                                                        })
                                                        .subscribe(sink::success, sink::error);
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
                            });
                });
    }

    public Mono<Boolean> createUser (User user) {
        user.setUserId(null);
        return userRepository.save(user)
                .map(savedUser -> savedUser != null && savedUser.getUserId() != null);
    }

    public Mono<Boolean> deleteUser(Integer userId) {
        return userRepository.existsById(userId)
                .flatMap(exists -> {
                    if (exists) {
                        return userRepository.findById(userId)
                                .flatMap(user -> clearUsers(user.getDeviceId(), userId)
                                        .then(userRepository.deleteById(userId))).thenReturn(true);
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
                            .flatMap(savedUser -> deviceRepository.findById(oldDeviceId)
                                    .flatMap(oldDevice -> {
                                        List<Integer> list = oldDevice.getUsers();
                                        list.remove(userId);
                                        oldDevice.setUsers(list);
                                        return deviceRepository.save(oldDevice);
                                    }).thenReturn(savedUser))
                            .flatMap(savedUser -> deviceRepository.findById(savedUser.getDeviceId())
                                    .flatMap(newDevice -> {
                                        List<Integer> list = newDevice.getUsers();
                                        if (!list.contains(userId)) {
                                            list.add(userId);
                                        }
                                        newDevice.setUsers(list);
                                        return deviceRepository.save(newDevice);
                                    }).thenReturn(savedUser))
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
    public Flux<Session> getSessionsUser (Integer userId) {
        return sessionRepository.findAllByUserId(userId);
    }

    public Flux<PulseMeasurement> getMeasurementsBySessionId (Integer sessionId) {
        return pulseMeasurementRepository.findAllBySessionId(sessionId);
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
