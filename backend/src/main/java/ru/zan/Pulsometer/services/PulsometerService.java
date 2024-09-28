package ru.zan.Pulsometer.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MqttDefaultFilePersistence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PulsometerService {

    private final UserRepository userRepository;

    private final DeviceRepository deviceRepository;

    private final PulseMeasurementRepository pulseMeasurementRepository;

    private final MqttAsyncClient mqttAsyncClient;

    private final ObjectMapper objectMapper;

    private final String persistenceDir = "src/main/resources/persistence";

    @Value("${hiveMQ.url}")
    private String hiveMQ;

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
        mqttAsyncClient = new MqttAsyncClient(hiveMQ, MqttAsyncClient.generateClientId(), persistence);
        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        mqttAsyncClient.connect(options, null, new IMqttActionListener() {
            @Override
            public void onSuccess(IMqttToken asyncActionToken) {
                System.out.println("The connection was successful.");
            }
            @Override
            public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                System.out.println("Connection error:" + exception.getMessage());
            }
        });
    }

    public Mono<Boolean> publish (Long deviceId, Long userId){
        String topic = "device/status/"+deviceId;
        String payload = "true";
        MqttMessage message = new MqttMessage(payload.getBytes());
        return Mono.create(sink -> {
            try {
                mqttAsyncClient.publish(topic, message, null, new IMqttActionListener() {
                    @Override
                    public void onSuccess(IMqttToken iMqttToken) {
                        deviceRepository.findById(deviceId)
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
                        reconnect();
                    }
                });
            } catch (MqttException e) {
                sink.error(e);
            }
        });
    }

    @PostConstruct
    public Mono<Void> subscribeToDate() {
        String topic = "device/data";
        return Mono.create(sink -> {
            try {
                mqttAsyncClient.subscribe(topic, 1, null, new IMqttActionListener() {
                    @Override
                    public void onSuccess(IMqttToken asyncActionToken) {
                        System.out.println("Subscribed to pulse data topic.");
                        sink.success();
                    }

                    @Override
                    public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                        System.out.println("Error subscribing to pulse data topic: " + exception.getMessage());
                        sink.error(exception);
                    }
                });

                mqttAsyncClient.setCallback(new MqttCallback() {
                    @Override
                    public void connectionLost(Throwable throwable) {
                        System.out.println("Connection lost: " + throwable.getMessage());
                        reconnect();
                    }

                    @Override
                    public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
                        String payload = new String(mqttMessage.getPayload());
                        PulseDataDTO pulseData = objectMapper.readValue(payload, PulseDataDTO.class);
                        PulseMeasurement pulseMeasurement = new PulseMeasurement();
                        deviceRepository.findById(pulseData.getId())
                                .flatMap(device -> {
                                    device.setStatus("ready");
                                    device.setLastContact(pulseData.getDate());
                                    pulseMeasurement.setUserId(device.getActiveUserId());
                                    return deviceRepository.save(device);
                                }).flatMap(savedDevice ->{
                                    pulseMeasurement.setBpm(pulseData.getBpm());
                                    pulseMeasurement.setDate(pulseData.getDate());
                                    return pulseMeasurementRepository.save(pulseMeasurement);
                                }).subscribe();
                    }

                    @Override
                    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
                    }
                });

            } catch (MqttException e) {
                sink.error(e);
            }
        });
    }

    @PostConstruct
    public Mono<Void> subscribeToDeviceStatus() {
        String topic = "device/status";
        return Mono.create(sink -> {
            try {
                mqttAsyncClient.subscribe(topic, 1, null, new IMqttActionListener() {
                    @Override
                    public void onSuccess(IMqttToken asyncActionToken) {
                        System.out.println("Subscribed to device status topic.");
                        sink.success();
                    }

                    @Override
                    public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                        System.out.println("Error subscribing to device status topic: " + exception.getMessage());
                        sink.error(exception);
                    }
                });

                mqttAsyncClient.setCallback(new MqttCallback() {
                    @Override
                    public void connectionLost(Throwable throwable) {
                        System.out.println("Connection lost: " + throwable.getMessage());
                        reconnect();
                    }

                    @Override
                    public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
                        String payload = new String(mqttMessage.getPayload());
                        StatusDataDTO statusData = objectMapper.readValue(payload, StatusDataDTO.class);
                        deviceRepository.existsById(statusData.getId())
                                .flatMap(exists -> {
                                    if (exists) {
                                        return deviceRepository.findById(statusData.getId())
                                                .flatMap(device -> {
                                                    device.setStatus("ready");
                                                    device.setLastContact(LocalDateTime.now());
                                                    return deviceRepository.save(device);
                                                });
                                    } else {
                                        Device device = new Device();
                                        device.setId(statusData.getId());
                                        device.setStatus("ready");
                                        device.setLastContact(LocalDateTime.now());
                                        return deviceRepository.save(device);
                                    }
                                })
                                .subscribe();
                    }

                    @Override
                    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
                    }
                });

            } catch (MqttException e) {
                sink.error(e);
            }
        });
    }


    private void reconnect() {
        Mono<Void> reconnectMono = Mono.create(sink -> {
            try {
                MqttConnectOptions options = new MqttConnectOptions();
                options.setCleanSession(true);
                mqttAsyncClient.connect(options, null, new IMqttActionListener() {
                    @Override
                    public void onSuccess(IMqttToken asyncActionToken) {
                        System.out.println("Reconnection completed successfully.");
                        sink.success();
                    }

                    @Override
                    public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                        System.out.println("Error when reconnecting:" + exception.getMessage());
                        sink.error(exception);
                    }
                });
            } catch (MqttException e) {
                sink.error(e);
            }
        });
        reconnectMono
                .doOnError(error -> System.out.println("Reconnection failed:" + error.getMessage()))
                .thenMany(
                        Flux.interval(Duration.ofSeconds(5))
                                .take(3)
                                .flatMap(tick -> {
                                    System.out.println("Trying to reconnect again...");
                                    return attemptReconnect();
                                })
                )
                .subscribe();
    }

    private Mono<Void> attemptReconnect() {
        return Mono.create(sink -> {
            try {
                MqttConnectOptions options = new MqttConnectOptions();
                options.setCleanSession(true);
                mqttAsyncClient.connect(options, null, new IMqttActionListener() {
                    @Override
                    public void onSuccess(IMqttToken asyncActionToken) {
                        System.out.println("Reconnection completed successfully");
                        sink.success();
                    }

                    @Override
                    public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                        System.out.println("Error when reconnecting:" + exception.getMessage());
                        sink.error(exception);
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

    public Mono<Boolean> deleteUser (long userId) {
        return userRepository.existsById(userId)
                .flatMap(exists -> {
                    if (exists) {
                        return userRepository.deleteById(userId).thenReturn(true);
                    } else {
                        return Mono.just(false);
                    }
                });
    }

    public Mono<Boolean> updateUser (long userId , UpdatedUserDTO updatedUserDTO) {
        return userRepository.findById(userId)
                .flatMap(user ->{
                    if(updatedUserDTO.getFio() != null) {
                        user.setFio(updatedUserDTO.getFio());
                    }
                    return userRepository.save(user);
                })
                .map(savedUser -> true)
                .defaultIfEmpty(false);
    }

    public Mono<User> getUser(long userId) {
        return userRepository.findById(userId);
    }

    public Flux<User> getAllUsers() {
        return userRepository.findAll();
    }

}
