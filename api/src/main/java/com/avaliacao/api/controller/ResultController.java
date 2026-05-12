package com.avaliacao.api.controller;

import com.avaliacao.api.models.FormAnswerModel;
import com.avaliacao.api.service.ResultService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService){
        this.resultService = resultService;
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<Object> getUserResults(
            @PathVariable(value = "userId") UUID userId){

        Optional<List<FormAnswerModel>> resultsO = resultService.findByUser(userId);

        if(resultsO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(resultsO.get());
    }

    @GetMapping("/forms/{formId}")
    public ResponseEntity<Object> getFormResults(
            @PathVariable(value = "formId") UUID formId){

        Optional<List<FormAnswerModel>> resultsO = resultService.findByForm(formId);

        if(resultsO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(resultsO.get());
    }

    @GetMapping("/trainings/{trainingId}")
    public ResponseEntity<Object> getTrainingResults(
            @PathVariable(value = "trainingId") UUID trainingId){

        Optional<List<FormAnswerModel>> resultsO = resultService.findByTraining(trainingId);

        if(resultsO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(resultsO.get());
    }

    @GetMapping("/trainings/{trainingId}/users/{userId}")
    public ResponseEntity<Object> getTrainingUserResults(
            @PathVariable(value = "trainingId") UUID trainingId,
            @PathVariable(value = "userId") UUID userId){

        Optional<List<FormAnswerModel>> resultsO = resultService.findByTrainingAndUser(trainingId,userId);

        if(resultsO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training or user not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(resultsO.get());
    }
}
