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
import ru.zan.Pulsometer.models.User;
import ru.zan.Pulsometer.services.PulsometerService;

@Tag(name = "Pulsometer")
@RestController
@RequestMapping("/api/pulse")
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
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping("")
    public Mono<ResponseEntity<Boolean>> saveUser (UserDTO userDTO){
        User user = convertToUser(userDTO);
        return pulsometerService.createUser(user).map(saved -> {
            if (saved) {
                return ResponseEntity.status(HttpStatus.CREATED).build();
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        });
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

    @Operation(summary = "Return a user by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{userId}")
    public Mono<ResponseEntity<User>> getUser(@PathVariable("userId") Long userId){
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
    @PatchMapping(value = "/{userId}")
    public Mono<ResponseEntity<Boolean>> updateUser (@PathVariable("userId") Long userId ,
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
    public Mono<ResponseEntity<Boolean>> deleteUser (@PathVariable("userId") Long userId){
        return pulsometerService.deleteUser(userId).map(idDeleted ->{
            if (idDeleted) {
                return ResponseEntity.status(HttpStatus.OK).build();
            }else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        });
    }

//    public Mono<ResponseEntity<Boolean>> createData

    private User convertToUser(UserDTO userDTO) {
        return modelMapper.map(userDTO, User.class);
    }

}
