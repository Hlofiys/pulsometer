package ru.zan.Pulsometer.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.zan.Pulsometer.DTOs.UpdatedUserDTO;
import ru.zan.Pulsometer.DTOs.UserDTO;
import ru.zan.Pulsometer.models.PulseMeasurement;
import ru.zan.Pulsometer.models.Session;
import ru.zan.Pulsometer.models.User;
import ru.zan.Pulsometer.services.PulsometerService;

@Tag(name = "User")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final PulsometerService pulsometerService;

    private final ModelMapper modelMapper;

    @Operation(summary = "Creating a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Device not found")
    })
    @PostMapping("")
    public Mono<ResponseEntity<?>> saveUser(@RequestBody UserDTO userDTO) {
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
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(false)));
    }

    @Operation(summary = "Retrieve all users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of received users"),
            @ApiResponse(responseCode = "204", description = "No users found")
    })
    @GetMapping("")
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

    @Operation(summary = "Get measurements by sessionId")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of received measurements"),
            @ApiResponse(responseCode = "204", description = "No measurements found")
    })
    @GetMapping("/{sessionId}/measurements")
    public Mono<ResponseEntity<Flux<PulseMeasurement>>> getMeasurementsBySessionId(@PathVariable("sessionId") Integer sessionId) {
        return pulsometerService.getMeasurementsBySessionId(sessionId)
                .collectList()
                .flatMap(pulseMeasurements ->{
                    if (pulseMeasurements.isEmpty()) {
                        return Mono.just(ResponseEntity.noContent().build());
                    }else {
                        return Mono.just(ResponseEntity.ok(Flux.fromIterable(pulseMeasurements)));
                    }
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

    @Operation(summary = "Return a session by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session found"),
            @ApiResponse(responseCode = "404", description = "Session not found")
    })
    @GetMapping("/{sessionId}/sessions/info")
    public Mono<ResponseEntity<Session>> getSession(@PathVariable("sessionId") Integer sessionId){
        return pulsometerService.getSession(sessionId)
                .map(session -> ResponseEntity.status(HttpStatus.OK).body(session))
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @Operation(summary = "Update user by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated"),
            @ApiResponse(responseCode = "400", description = "Invalid data"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PatchMapping(value = "/{userId}")
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

    @Operation(summary = "Retrieve session")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of received session"),
            @ApiResponse(responseCode = "204", description = "No session found")
    })
    @GetMapping("/{userId}/sessions")
    public Mono<ResponseEntity<Flux<Session>>> getSessionsUser (@PathVariable("userId") Integer userId){
        return pulsometerService.getSessionsUser(userId)
                .collectList()
                .flatMap(sessions -> {
                    if (sessions.isEmpty()) {
                        return Mono.just(ResponseEntity.noContent().build());
                    }else {
                        return Mono.just(ResponseEntity.ok(Flux.fromIterable(sessions)));
                    }
                });

    }

    private User convertToUser(UserDTO userDTO) {
        return modelMapper.map(userDTO, User.class);
    }
}
