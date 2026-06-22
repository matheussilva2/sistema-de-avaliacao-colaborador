package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.FormAttemptResponseDTO;
import com.avaliacao.api.service.FormAttemptService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
public class FormAttemptController {

    private final FormAttemptService formAttemptService;

    public FormAttemptController(FormAttemptService formAttemptService){
        this.formAttemptService = formAttemptService;
    }

    @PostMapping("/forms/{formId}/users/{userId}/attempt")
    public ResponseEntity<Object> startAttempt(
            @PathVariable(value = "formId") UUID formId,
            @PathVariable(value = "userId") UUID userId){

        Optional<FormAttemptResponseDTO> attemptO = formAttemptService.start(formId,userId);

        if(attemptO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form or user not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(attemptO.get());
    }
}
