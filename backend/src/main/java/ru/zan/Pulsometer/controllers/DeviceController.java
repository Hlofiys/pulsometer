package ru.zan.Pulsometer.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.models.Device;
import ru.zan.Pulsometer.models.User;
import ru.zan.Pulsometer.services.PulsometerService;
import ru.zan.Pulsometer.util.DeviceNotFoundException;
import ru.zan.Pulsometer.util.ErrorResponse;

@Tag(name = "Device")
@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final PulsometerService pulsometerService;

    @Autowired
    public DeviceController(PulsometerService pulsometerService) {
        this.pulsometerService = pulsometerService;
    }

    @Operation(summary = "Retrieve all devices")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of received devices"),
            @ApiResponse(responseCode = "204", description = "No devices found")
    })
    @GetMapping("")
    public Mono<ResponseEntity<Flux<Device>>> getDevices (){
        return pulsometerService.getAllDevices()
                .collectList()
                .flatMap(devices -> {
                    if (devices.isEmpty()) {
                        return Mono.just(ResponseEntity.noContent().build());
                    }else
                        return Mono.just(ResponseEntity.ok(Flux.fromIterable(devices)));
                });
    }

    @Operation(summary = "Returns all users of the device")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of received users"),
            @ApiResponse(responseCode = "204", description = "No users found")
    })
    @GetMapping("/{deviceId}/users")
    public Mono<ResponseEntity<Flux<User>>> getDeviceUsers (@PathVariable("deviceId") Integer deviceId){
        return pulsometerService.getDeviceUsers(deviceId)
                .collectList()
                .flatMap(users -> {
                    if (users.isEmpty()) {
                        return Mono.just(ResponseEntity.ok(Flux.empty()));
                    }else {
                        return Mono.just(ResponseEntity.ok(Flux.fromIterable(users)));
                    }
                })
                .map(response -> (ResponseEntity<Flux<User>>) response)
                .defaultIfEmpty(ResponseEntity.ok(Flux.empty()));
    }

    @Operation(summary = "Switching the device status and setting the active user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status changed"),
            @ApiResponse(responseCode = "400", description = "Invalid data"),
            @ApiResponse(responseCode = "404", description = "Device not found")
    })
    @PatchMapping("/{deviceId}")
    public Mono<ResponseEntity<?>> createData (@PathVariable("deviceId") Integer deviceId,
                                               @RequestParam(value = "activeUserId",required = false) Integer activeUserId
    ) throws Exception{
        if (deviceId == null || deviceId <= 0) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Invalid or missing deviceId", HttpStatus.BAD_REQUEST.value())));
        }

        return pulsometerService.publish(deviceId, activeUserId)
                .map(isPublish -> {
                    if (isPublish) {
                        return ResponseEntity.ok(true);
                    } else {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ErrorResponse("Failed to process the request", HttpStatus.BAD_REQUEST.value()));
                    }
                })
                .onErrorResume(e -> {
                    if (e instanceof DeviceNotFoundException) {
                        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(new ErrorResponse("Device not found with ID: " + deviceId, HttpStatus.NOT_FOUND.value())));
                    } else if (e instanceof IllegalArgumentException) {
                        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value())));
                    }
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new ErrorResponse("An internal error occurred", HttpStatus.INTERNAL_SERVER_ERROR.value())));
                });
    }
}
