package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.UserRecordDTO;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.models.UserModel;
import com.avaliacao.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }


    @PostMapping
    public ResponseEntity<Object> CreateUser(
            @RequestBody @Valid UserRecordDTO userRecordDTO){

        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(userService.create(userRecordDTO));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(exception.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<UserModel>> getAllUsers(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOneUser(@PathVariable(value = "id") UUID id){

        Optional<UserModel> userO = userService.findById(id);

        if(userO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(userO.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateUser(@PathVariable(value = "id") UUID id,
                                             @RequestBody @Valid UserRecordDTO userRecordDTO){

        Optional<UserModel> userO;

        try {
            userO = userService.update(id,userRecordDTO);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(exception.getMessage());
        }

        if(userO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(userO.get());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteUser(@PathVariable(value = "id") UUID id){
        boolean status = userService.delete(id);

        if(!status){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body("User deleted successfully");
    }

    @GetMapping("/{id}/trainings")
    public ResponseEntity<Object> getUserTrainings(@PathVariable(value = "id") UUID id){
        Optional<Set<TrainingModel>> trainingsO = userService.findTrainingsByUser(id);

        if(trainingsO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(trainingsO.get());
    }

}
