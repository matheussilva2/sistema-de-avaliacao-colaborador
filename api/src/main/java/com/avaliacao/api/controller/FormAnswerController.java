package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.FormAnswerRecordDTO;
import com.avaliacao.api.models.FormAnswerModel;
import com.avaliacao.api.service.FormAnswerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class FormAnswerController {

    private final FormAnswerService formAnswerService;

    public FormAnswerController(FormAnswerService formAnswerService){
        this.formAnswerService = formAnswerService;
    }

    @PostMapping("/forms/{formId}/users/{userId}/answers")
    public ResponseEntity<Object> createAnswer(
            @PathVariable(value = "formId") UUID formId,
            @PathVariable(value = "userId") UUID userId,
            @RequestBody @Valid FormAnswerRecordDTO formAnswerRecordDTO){

        Optional<FormAnswerModel> answerO = formAnswerService.create(formId,userId,formAnswerRecordDTO);

        if(answerO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form, user, question or alternative not found.");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(answerO.get());
    }

    @GetMapping("/answers")
    public ResponseEntity<List<FormAnswerModel>> getAllAnswers(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(formAnswerService.findAll());
    }

    @GetMapping("/answers/{id}")
    public ResponseEntity<Object> getOneAnswer(@PathVariable(value = "id") UUID id){
        Optional<FormAnswerModel> answerO = formAnswerService.findById(id);

        if(answerO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Answer not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(answerO.get());
    }

    @GetMapping("/forms/{formId}/answers")
    public ResponseEntity<Object> getFormAnswers(
            @PathVariable(value = "formId") UUID formId){

        Optional<List<FormAnswerModel>> answersO = formAnswerService.findByForm(formId);

        if(answersO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(answersO.get());
    }

    @GetMapping("/users/{userId}/answers")
    public ResponseEntity<Object> getUserAnswers(
            @PathVariable(value = "userId") UUID userId){

        Optional<List<FormAnswerModel>> answersO = formAnswerService.findByUser(userId);

        if(answersO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(answersO.get());
    }

    @GetMapping("/forms/{formId}/users/{userId}/answers")
    public ResponseEntity<Object> getFormUserAnswers(
            @PathVariable(value = "formId") UUID formId,
            @PathVariable(value = "userId") UUID userId){

        Optional<List<FormAnswerModel>> answersO = formAnswerService.findByFormAndUser(formId,userId);

        if(answersO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form or user not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(answersO.get());
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<Object> deleteAnswer(@PathVariable(value = "id") UUID id){
        boolean status = formAnswerService.delete(id);

        if(!status){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Answer not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body("Answer deleted successfully");
    }
}
