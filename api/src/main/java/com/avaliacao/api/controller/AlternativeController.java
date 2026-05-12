package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.AlternativeRecordDTO;
import com.avaliacao.api.models.AlternativeModel;
import com.avaliacao.api.service.AlternativeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class AlternativeController {

    private final AlternativeService alternativeService;

    public AlternativeController(AlternativeService alternativeService){
        this.alternativeService = alternativeService;
    }

    @PostMapping("/questions/{questionId}/alternatives")
    public ResponseEntity<Object> createAlternative(
            @PathVariable(value = "questionId") UUID questionId,
            @RequestBody @Valid AlternativeRecordDTO alternativeRecordDTO){

        Optional<AlternativeModel> alternativeO = alternativeService.create(questionId,alternativeRecordDTO);

        if(alternativeO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Question not found.");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(alternativeO.get());
    }

    @GetMapping("/alternatives")
    public ResponseEntity<List<AlternativeModel>> getAllAlternatives(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(alternativeService.findAll());
    }

    @GetMapping("/alternatives/{id}")
    public ResponseEntity<Object> getOneAlternative(@PathVariable(value = "id") UUID id){
        Optional<AlternativeModel> alternativeO = alternativeService.findById(id);

        if(alternativeO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Alternative not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(alternativeO.get());
    }

    @GetMapping("/questions/{questionId}/alternatives")
    public ResponseEntity<Object> getQuestionAlternatives(
            @PathVariable(value = "questionId") UUID questionId){

        Optional<List<AlternativeModel>> alternativesO = alternativeService.findByQuestion(questionId);

        if(alternativesO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Question not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(alternativesO.get());
    }

    @PutMapping("/alternatives/{id}")
    public ResponseEntity<Object> updateAlternative(@PathVariable(value = "id") UUID id,
                                                    @RequestBody @Valid AlternativeRecordDTO alternativeRecordDTO){

        Optional<AlternativeModel> alternativeO = alternativeService.update(id,alternativeRecordDTO);

        if(alternativeO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Alternative not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(alternativeO.get());
    }

    @DeleteMapping("/alternatives/{id}")
    public ResponseEntity<Object> deleteAlternative(@PathVariable(value = "id") UUID id){
        boolean status = alternativeService.delete(id);

        if(!status){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Alternative not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body("Alternative deleted successfully");
    }
}
