package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.LoginRecordDTO;
import com.avaliacao.api.models.UserModel;
import com.avaliacao.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody @Valid LoginRecordDTO loginRecordDTO){
        Optional<UserModel> userO = userService.login(loginRecordDTO);

        if(userO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(userO.get());
    }
}
