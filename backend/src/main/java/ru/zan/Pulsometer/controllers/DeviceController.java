package ru.zan.Pulsometer.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.DTOs.DeviceDTO;
import ru.zan.Pulsometer.models.User;
import ru.zan.Pulsometer.services.PulsometerService;
import ru.zan.Pulsometer.util.*;

@Tag(name = "Device")
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final PulsometerService pulsometerService;

    @Operation(summary = "Retrieve all devices")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of received devices"),
            @ApiResponse(responseCode = "204", description = "No devices found")
    })
    @GetMapping("")
    public Mono<ResponseEntity<Flux<DeviceDTO>>> getDevices (){
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

    @Operation(summary = "Activate a device and assign it to a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Device successfully activated and assigned to the user"),
            @ApiResponse(responseCode = "400", description = "Invalid device ID or user ID provided"),
            @ApiResponse(responseCode = "404", description = "Device not found"),
            @ApiResponse(responseCode = "500", description = "Unexpected server error")
    })
    @PostMapping("/activate")
    public Mono<ResponseEntity<?>> manageStatusActivate (@RequestParam(value = "activeUserId") Integer activeUserId,
                                                         @RequestParam(value = "typeActivity") String typeActivity){
        if (activeUserId == null || activeUserId <= 0) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Invalid or missing activeUserId", HttpStatus.BAD_REQUEST.value())));
        }

        if (typeActivity == null || typeActivity.trim().isEmpty()) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Invalid or missing typeActivity", HttpStatus.BAD_REQUEST.value())));
        }

        return pulsometerService.publishActivate(activeUserId,typeActivity)
                .map(isPublish -> isPublish
                        ? ResponseEntity.ok(pulsometerService.getOpenSessionByUserId(activeUserId))
                        : ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Failed to process the request", HttpStatus.BAD_REQUEST.value())))
                .onErrorResume(this::handleError);
    }

    @Operation(summary = "Deactivate a device and remove the active user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Device successfully deactivated"),
            @ApiResponse(responseCode = "400", description = "Invalid or missing user ID"),
            @ApiResponse(responseCode = "500", description = "Unexpected server error")
    })
    @PostMapping("/deactivate")
    public Mono<ResponseEntity<?>> manageStatusDeactivate (@RequestParam(value = "activeUserId") Integer activeUserId){
        if (activeUserId == null || activeUserId <= 0) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Invalid or missing activeUserId", HttpStatus.BAD_REQUEST.value())));
        }

        return pulsometerService.publishDeactivate(activeUserId)
                .map(isPublish -> isPublish
                        ? ResponseEntity.ok(true)
                        : ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Failed to process the request", HttpStatus.BAD_REQUEST.value())))
                .onErrorResume(this::handleError);
    }

    private Mono<ResponseEntity<ErrorResponse>> handleError(Throwable e) {
        if (e instanceof IllegalArgumentException) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value())));
        } else if (e instanceof DeviceNotFoundException) {
            return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value())));
        } else if (e instanceof UserNotFoundException) {
            return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value())));
        } else if (e instanceof InvalidDeviceUserMappingException) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value())));
        }else if (e instanceof ActiveSessionException){
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value())));
        }else if (e instanceof SessionNotFoundException){
            return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value())));
        }
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Unexpected error occurred: " + e.getMessage(), HttpStatus.BAD_REQUEST.value())));
    }
}
