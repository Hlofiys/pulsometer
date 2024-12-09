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
import ru.zan.Pulsometer.DTOs.*;
import ru.zan.Pulsometer.models.Device;
import ru.zan.Pulsometer.models.PulseMeasurement;
import ru.zan.Pulsometer.models.Session;
import ru.zan.Pulsometer.models.User;
import ru.zan.Pulsometer.repositories.DeviceRepository;
import ru.zan.Pulsometer.repositories.PulseMeasurementRepository;
import ru.zan.Pulsometer.repositories.SessionRepository;
import ru.zan.Pulsometer.repositories.UserRepository;
import ru.zan.Pulsometer.util.*;

import java.io.File;
import java.io.IOException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class PulsometerService {

    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final PulseMeasurementRepository pulseMeasurementRepository;
    private final SessionRepository sessionRepository;
    private final ObjectMapper objectMapper;
    private MqttAsyncClient mqttAsyncClient;
    private final ScheduledExecutorService reconnectScheduler = Executors.newSingleThreadScheduledExecutor();
    private static final int RECONNECT_DELAY = 5;
    private static final String persistenceDir = "src/main/resources/persistence";
    private final SseBroadcastService sseBroadcastService;

    @Autowired
    public PulsometerService(UserRepository userRepository,
                             DeviceRepository deviceRepository,
                             PulseMeasurementRepository pulseMeasurementRepository, SessionRepository sessionRepository,
                             ObjectMapper objectMapper,SseBroadcastService sseBroadcastService) throws MqttException {
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.pulseMeasurementRepository = pulseMeasurementRepository;
        this.sessionRepository = sessionRepository;
        this.objectMapper = objectMapper;
        this.sseBroadcastService = sseBroadcastService;

        initializeMqttClient();
    }

    private void initializeMqttClient() throws MqttException {
        MqttDefaultFilePersistence persistence = new MqttDefaultFilePersistence(persistenceDir);
        mqttAsyncClient = new MqttAsyncClient("tcp://broker.hivemq.com:1883", MqttAsyncClient.generateClientId(), persistence);

        mqttAsyncClient.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {
                System.out.println("Connection lost: " + cause.getMessage());
                scheduleReconnect();
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) {
                if (topic.equalsIgnoreCase("device/status")) {
                    processMessageStatus(topic, message);
                } else if (topic.equalsIgnoreCase("device/data")) {
                    processMessageData(topic, message);
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {
            }
        });

        connectToBroker();
    }

    private void connectToBroker() {
        try {
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);

            mqttAsyncClient.connect(options, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    System.out.println("Connected successfully.");
                    subscribeToTopic("device/status");
                    subscribeToTopic("device/data");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    System.out.println("Connection failed: " + exception.getMessage());
                    scheduleReconnect();
                }
            });
        } catch (MqttException e) {
            System.out.println("Error during connection: " + e.getMessage());
            scheduleReconnect();
        }
    }

    private void scheduleReconnect() {
        reconnectScheduler.schedule(this::connectToBroker, RECONNECT_DELAY, TimeUnit.SECONDS);
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

        deviceRepository.existsByDeviceId(statusData.getId())
                .flatMap(exists -> {
                    if (!exists) {
                        Device newDevice = new Device();
                        newDevice.setDeviceId(statusData.getId());
                        newDevice.setStatus("ready");
                        newDevice.setLastContact(LocalDateTime.now());
                        return deviceRepository.saveNewDeviceIfNotExists(newDevice.getDeviceId(), newDevice.getStatus(), newDevice.getLastContact())
                                .doOnSuccess(savedDevice->
                                sseBroadcastService.sendStatusMessage(serializeStatusSseDTO(statusData.getId(),"ready")));
                    } else {
                        return deviceRepository.findById(statusData.getId())
                                .flatMap(device -> {
                                    String currentStatus = device.getStatus();
                                    String newStatus = currentStatus.equalsIgnoreCase("measuring") ? "measuring" : "ready";
                                    device.setLastContact(LocalDateTime.now());
                                    device.setStatus(newStatus);
                                    System.out.println("Updating device with new status: " + newStatus);
                                    return deviceRepository.save(device)
                                            .doOnSuccess(savedDevice->
                                            sseBroadcastService.sendStatusMessage(serializeStatusSseDTO(statusData.getId(),newStatus)));
                                });
                    }
                })
                .doOnSuccess(device -> System.out.println("Device successfully processed: "))
                .doOnError(e -> System.err.println("Error processing device: " + e.getMessage()))
                .subscribe();
    }

    private void processMessageData(String topic, MqttMessage mqttMessage) {
        String payload = new String(mqttMessage.getPayload());
        System.out.println("Message arrived on topic '" + topic + "': " + payload);

        PulseMeasurement pulseMeasurement = new PulseMeasurement();
        PulseDataDTO pulseDataDTO;
        try {
            pulseDataDTO = objectMapper.readValue(payload, PulseDataDTO.class);
        } catch (JsonProcessingException e) {
            System.err.println("Failed to parse message payload: " + e.getMessage());
            return;
        }

        LocalDateTime measurementTime = TimeUtils.convertEpochMillisToUTC(pulseDataDTO.getTime());
        pulseMeasurementRepository.existsByDate(measurementTime)
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.empty();
                    } else {
                        return deviceRepository.findById(pulseDataDTO.getId())
                                .flatMap(device -> {

                                    if ("off".equalsIgnoreCase(device.getStatus())) {
                                        device.setStatus("ready");
                                        device.setLastContact(measurementTime);
                                    } else {
                                        device.setStatus("measuring");
                                    }

                                    sseBroadcastService.sendStatusMessage(
                                            serializeStatusSseDTO(device.getDeviceId(), device.getStatus())
                                    );

                                    return deviceRepository.save(device);
                                })
                                .flatMap(savedDevice -> {
                                    pulseMeasurement.setBpm(pulseDataDTO.getBpm());
                                    pulseMeasurement.setDate(measurementTime);
                                    pulseMeasurement.setSessionId(pulseDataDTO.getSessionId());
                                    pulseMeasurement.setOxygen(pulseDataDTO.getOxygen());

                                    return sessionRepository.findById(pulseDataDTO.getSessionId())
                                            .flatMap(receivedSession -> {
                                                if (receivedSession.getSessionStatus().equalsIgnoreCase("Closed")) {
                                                    receivedSession.setSessionStatus("Open");
                                                }
                                                long elapsedMillis = Duration.between(receivedSession.getTime(), measurementTime).toMillis();
                                                receivedSession.setPassed(elapsedMillis);
                                                receivedSession.setTime(measurementTime);
                                                return sessionRepository.save(receivedSession);
                                            })
                                            .then(Mono.just(pulseMeasurement));
                                })
                                .flatMap(pulseMeasurementRepository::save);
                    }
                })
                .flatMap(savedMeasurement ->
                        pulseMeasurementRepository.findAllBySessionId(pulseDataDTO.getSessionId())
                                .collectList()
                                .doOnNext(pulseMeasurements -> {
                                    List<DataSseDTO> dataSseDTOList = pulseMeasurements.stream()
                                            .map(mappedPulseMeasurement -> {
                                                DataSseDTO dto = new DataSseDTO();
                                                dto.setId(mappedPulseMeasurement.getMeasurementId());
                                                dto.setBpm(mappedPulseMeasurement.getBpm());
                                                dto.setOxygen(mappedPulseMeasurement.getOxygen());
                                                dto.setSessionId(mappedPulseMeasurement.getSessionId());
                                                dto.setDate(mappedPulseMeasurement.getDate() != null ? mappedPulseMeasurement.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null);
                                                return dto;
                                            })
                                            .collect(Collectors.toList());
                                    sseBroadcastService.sendDataMessage(serializeDataSseDTO(dataSseDTOList));
                                })
                )
                .doOnError(e -> System.err.println("Error occurred while processing pulse measurement: " + e.getMessage()))
                .subscribe();
    }

    private Mono<String> createActivateMessage(Integer userId,String typeActivity) {
        String sessionStatus = "Open";
        return sessionRepository.existsByUserIdAndSessionStatus(userId,sessionStatus)
                .flatMap(exists->{
                    if (exists) {
                        return Mono.error(new ActiveSessionException("User already has an open session"));
                    }else {
                        Session session = new Session();
                        session.setUserId(userId);
                        session.setTime(LocalDateTime.now());
                        session.setTypeActivity(typeActivity);

                        return sessionRepository.save(session)
                                .flatMap(savedSession -> {
                                    String isActivateValue ="1";
                                    MqttPayload payloadObject = createMqttPayload(isActivateValue,savedSession.getSessionId());
                                    ObjectMapper objectMapper = new ObjectMapper();
                                    try {
                                        String payload = objectMapper.writeValueAsString(payloadObject);
                                        return Mono.just(payload);
                                    } catch (JsonProcessingException e) {
                                        return Mono.error(new RuntimeException("Error serializing payload", e));
                                    }
                                });
                    }
                });
    }

    private MqttPayload createMqttPayload(String isActivateValue, Integer sessionId) {
        return new MqttPayload(isActivateValue, sessionId);
    }

    public Mono<Boolean> publishActivate(Integer userId,String typeActivity) {
        return deviceRepository.findFirstByUserIdInUsers(userId)
                .switchIfEmpty(Mono.error(new DeviceNotFoundException("Device with such user not found: " + userId)))
                .flatMap(device -> {

                    if ("off".equalsIgnoreCase(device.getStatus())) {
                        return Mono.error(new IllegalStateException("Cannot start session: device status is 'off'"));
                    }
                    return hasSingleActiveSession(device.getUsers())
                            .flatMap(exists->{
                                if (exists) {
                                    return Mono.error(new ActiveSessionException("There is already an active session for one of the device's users."));
                                }
                                return userRepository.findById(userId)
                                        .switchIfEmpty(Mono.error(new UserNotFoundException("User not found with ID: " + userId)))
                                        .flatMap(user -> {

                                            if (!device.getUsers().contains(user.getUserId())) {
                                                return Mono.error(new InvalidDeviceUserMappingException(
                                                        "User with ID: " + userId + " does not have access to device with ID: " + device.getDeviceId()));
                                            }
                                            String topic = "device/switch/" + device.getDeviceId();
                                            return createActivateMessage(userId,typeActivity)
                                                    .flatMap(payload -> publishMqttMessage(topic, payload))
                                                    .flatMap(success -> {
                                                        device.setStatus("measuring");
                                                        sseBroadcastService.sendStatusMessage(serializeStatusSseDTO(device.getDeviceId(),"measuring"));
                                                        device.setActiveUserId(userId);
                                                        return deviceRepository.save(device).thenReturn(true);
                                                    });
                                        });
                            });
                });
    }

    private Mono<Boolean> publishMqttMessage(String topic, String payload) {
        return Mono.create(sink -> {
            try {
                mqttAsyncClient.publish(topic, new MqttMessage(payload.getBytes()), null, new IMqttActionListener() {
                    @Override
                    public void onSuccess(IMqttToken asyncActionToken) {
                        sink.success(true);
                    }

                    @Override
                    public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                        sink.error(exception);
                    }
                });
            } catch (MqttException e) {
                sink.error(e);
            }
        });
    }

    private Mono<Boolean> hasSingleActiveSession(List<Integer> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Mono.just(false);
        }

        return sessionRepository.existsMultipleActiveSessionsByUserIds(userIds)
                .map(exists -> exists);
    }

    private Mono<String> createDeactivateMessage(Integer userId) {
        String sessionStatus = "Open";
        return sessionRepository.existsByUserIdAndSessionStatus(userId,sessionStatus)
                .flatMap(exists ->{
                    if (exists) {
                        return sessionRepository.findFirstByUserIdAndSessionStatus(userId,sessionStatus)
                                .flatMap(session -> {
                                    session.setSessionStatus("Closed");
                                    return sessionRepository.save(session)
                                            .flatMap(savedSession->{
                                                String isActivateValue ="0";
                                                MqttPayload payloadObject = createMqttPayload(isActivateValue,savedSession.getSessionId());
                                                ObjectMapper objectMapper = new ObjectMapper();
                                                try {
                                                    String payload = objectMapper.writeValueAsString(payloadObject);
                                                    return Mono.just(payload);
                                                } catch (JsonProcessingException e) {
                                                    return Mono.error(new PayloadSerializationException("Error serializing payload"));
                                                }
                                            });
                                });
                    }else {
                        return Mono.error(new SessionNotFoundException("No active session found for user ID: " + userId));
                    }
                });
    }

    public Mono<Boolean> publishDeactivate(Integer userId) {
        return deviceRepository.findByActiveUserId(userId)
                .switchIfEmpty(Mono.error(new UserNotFoundException("User not found with ID: " + userId)))
                .flatMap(device -> {
                    String topic = "device/switch/" + device.getDeviceId();
                    device.setStatus("ready");
                    sseBroadcastService.sendStatusMessage(serializeStatusSseDTO(device.getDeviceId(),"ready"));

                    return createDeactivateMessage(userId)
                            .flatMap(payload -> publishMqttMessage(topic, payload))
                            .flatMap(success -> deviceRepository.save(device).thenReturn(true));
                });
    }

    public Mono<Integer> getOpenSessionByUserId (Integer userId) {
        return sessionRepository.findOpenSessionIdByUserId(userId)
                .switchIfEmpty(Mono.error(new RuntimeException("No open session found for userId: " + userId)));
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

    public Flux<DeviceDTO> getAllDevices() {
        return deviceRepository.findAll()
                .flatMap(device -> {
                    if (device.getActiveUserId() != null) {
                        return sessionRepository.findOpenSessionIdByUserId(device.getActiveUserId())
                                .map(sessionId -> mapToDeviceDTO(device, sessionId))
                                .switchIfEmpty(Mono.just(mapToDeviceDTO(device, null)));
                    }
                    return Mono.just(mapToDeviceDTO(device, null));
                });
    }

    private DeviceDTO mapToDeviceDTO(Device device, Integer sessionId) {
        return new DeviceDTO(
                device.getDeviceId(),
                device.getStatus(),
                sessionId,
                device.getLastContact(),
                device.getUsers()
        );
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

    public Mono<Session> getSession(Integer sessionId) {
        return sessionRepository.findById(sessionId);
    }


    @Scheduled(fixedRate = 120000)
    public void updateDeviceStatus() {
        LocalDateTime twoMinutesAgo = Instant.now()
                .minus(110, ChronoUnit.SECONDS)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        deviceRepository.findAll()
                .filter(device -> device.getLastContact().isBefore(twoMinutesAgo))
                .flatMap(device -> {
                    device.setStatus("off");
                    sseBroadcastService.sendStatusMessage(serializeStatusSseDTO(device.getDeviceId(),"off"));
                    return deviceRepository.save(device)
                            .flatMap(savedDevice-> closeOpenSessionsForUsers(savedDevice.getUsers()));
                })
                .subscribe();
    }

    private Mono<Void> closeOpenSessionsForUsers(List<Integer> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Mono.empty();
        }
        return sessionRepository.updateSessionStatusForUsers(userIds);
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

    private String serializeStatusSseDTO (Integer id,String status) {
        StatusSseDTO statusSseDTO = new StatusSseDTO(id, status);
        try {
            return objectMapper.writeValueAsString(statusSseDTO);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize object", e);
        }
    }

    private String serializeDataSseDTO (List<DataSseDTO> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize object", e);
        }
    }

}
