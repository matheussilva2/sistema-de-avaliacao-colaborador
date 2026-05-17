package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.FormRecordDTO;
import com.avaliacao.api.models.FormModel;
import com.avaliacao.api.service.FormService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class FormController {

    private final FormService formService;

    public FormController(FormService formService){
        this.formService = formService;
    }

    @PostMapping("/trainings/{trainingId}/forms")
    public ResponseEntity<Object> createForm(
            @PathVariable(value = "trainingId") UUID trainingId,
            @RequestBody @Valid FormRecordDTO formRecordDTO){

        Optional<FormModel> formO = formService.create(trainingId,formRecordDTO);

        if(formO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training not found.");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(formO.get());
    }

    @GetMapping("/forms")
    public ResponseEntity<List<FormModel>> getAllForms(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(formService.findAll());
    }

    @GetMapping("/forms/{id}")
    public ResponseEntity<Object> getOneForm(@PathVariable(value = "id") UUID id){
        Optional<FormModel> formO = formService.findById(id);

        if(formO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(formO.get());
    }

    @GetMapping("/trainings/{trainingId}/forms")
    public ResponseEntity<Object> getTrainingForms(
            @PathVariable(value = "trainingId") UUID trainingId){

        Optional<List<FormModel>> formsO = formService.findByTraining(trainingId);

        if(formsO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Training not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(formsO.get());
    }

    @PutMapping("/forms/{id}")
    public ResponseEntity<Object> updateForm(@PathVariable(value = "id") UUID id,
                                             @RequestBody @Valid FormRecordDTO formRecordDTO){

        Optional<FormModel> formO = formService.update(id,formRecordDTO);

        if(formO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(formO.get());
    }

    @DeleteMapping("/forms/{id}")
    public ResponseEntity<Object> deleteForm(@PathVariable(value = "id") UUID id){
        boolean status = formService.delete(id);

        if(!status){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body("Form deleted successfully");
    }
}
