package ru.zan.Pulsometer.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.DTOs.UpdatedUserDTO;
import ru.zan.Pulsometer.DTOs.UserDTO;
import ru.zan.Pulsometer.models.Device;
import ru.zan.Pulsometer.models.User;
import ru.zan.Pulsometer.services.PulsometerService;
import ru.zan.Pulsometer.util.DeviceNotFoundException;
import ru.zan.Pulsometer.util.ErrorResponse;

@Tag(name = "Pulsometer")
@RestController
@RequestMapping("/api/devices")
public class PulsometerController {

    private final PulsometerService pulsometerService;
    private final ModelMapper modelMapper;

    @Autowired
    public PulsometerController(PulsometerService pulsometerService, ModelMapper modelMapper) {
        this.pulsometerService = pulsometerService;
        this.modelMapper = modelMapper;
    }

    @Operation(summary = "Creating a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Device not found")
    })
    @PostMapping("")
    public Mono<ResponseEntity<?>> saveUser(UserDTO userDTO) {
        User user = convertToUser(userDTO);
        return pulsometerService.checkDeviceExists(user.getDeviceId())
                .flatMap(deviceExists -> {
                    if (!deviceExists) {
                        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(false));
                    }
                    return pulsometerService.createUser(user)
                            .map(saved -> {
                                if (saved) {
                                    return ResponseEntity.status(HttpStatus.CREATED).build();
                                } else {
                                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                                }
                            });
                })
                .onErrorResume(e -> {
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(false));
                });
    }



    @Operation(summary = "Retrieve all users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of received users"),
            @ApiResponse(responseCode = "204", description = "No users found")
    })
    @GetMapping("/users")
    public Mono<ResponseEntity<Flux<User>>> getUsers (){
        return pulsometerService.getAllUsers()
                .collectList()
                .flatMap(users -> {
                    if (users.isEmpty()) {
                        return Mono.just(ResponseEntity.noContent().build());
                    } else {
                        return Mono.just(ResponseEntity.ok(Flux.fromIterable(users)));
                    }
                });
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

    @Operation(summary = "Return a user by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{userId}")
    public Mono<ResponseEntity<User>> getUser(@PathVariable("userId") Integer userId){
        return pulsometerService.getUser(userId)
                .map(user -> ResponseEntity.status(HttpStatus.OK).body(user))
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @Operation(summary = "Update user by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated"),
            @ApiResponse(responseCode = "400", description = "Invalid data"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PatchMapping(value = "/update/{userId}")
    public Mono<ResponseEntity<Boolean>> updateUser (@PathVariable("userId") Integer userId ,
                                                     @RequestBody() UpdatedUserDTO updatedUserDTO){
        return pulsometerService.updateUser(userId,updatedUserDTO).map(isUpdated ->{
            if (isUpdated) {
                return ResponseEntity.status(HttpStatus.OK).build();
            }else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        });
    }

    @Operation(summary = "Delete user by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User deleted"),
            @ApiResponse(responseCode = "400", description = "Invalid data"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{userId}")
    public Mono<ResponseEntity<Boolean>> deleteUser (@PathVariable("userId") Integer userId){
        return pulsometerService.deleteUser(userId).map(idDeleted ->{
            if (idDeleted) {
                return ResponseEntity.status(HttpStatus.OK).build();
            }else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        });
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

    private User convertToUser(UserDTO userDTO) {
        return modelMapper.map(userDTO, User.class);
    }

}
