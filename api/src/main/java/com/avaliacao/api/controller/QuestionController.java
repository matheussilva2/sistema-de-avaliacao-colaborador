package com.avaliacao.api.controller;

import com.avaliacao.api.dtos.QuestionRecordDTO;
import com.avaliacao.api.models.QuestionModel;
import com.avaliacao.api.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService){
        this.questionService = questionService;
    }

    @PostMapping("/forms/{formId}/questions")
    public ResponseEntity<Object> createQuestion(
            @PathVariable(value = "formId") UUID formId,
            @RequestBody @Valid QuestionRecordDTO questionRecordDTO){

        Optional<QuestionModel> questionO = questionService.create(formId,questionRecordDTO);

        if(questionO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form not found.");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(questionO.get());
    }

    @GetMapping("/questions")
    public ResponseEntity<List<QuestionModel>> getAllQuestions(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(questionService.findAll());
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<Object> getOneQuestion(@PathVariable(value = "id") UUID id){
        Optional<QuestionModel> questionO = questionService.findById(id);

        if(questionO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Question not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(questionO.get());
    }

    @GetMapping("/forms/{formId}/questions")
    public ResponseEntity<Object> getFormQuestions(
            @PathVariable(value = "formId") UUID formId){

        Optional<List<QuestionModel>> questionsO = questionService.findByForm(formId);

        if(questionsO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Form not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(questionsO.get());
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<Object> updateQuestion(@PathVariable(value = "id") UUID id,
                                                 @RequestBody @Valid QuestionRecordDTO questionRecordDTO){

        Optional<QuestionModel> questionO = questionService.update(id,questionRecordDTO);

        if(questionO.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Question not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(questionO.get());
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Object> deleteQuestion(@PathVariable(value = "id") UUID id){
        boolean status = questionService.delete(id);

        if(!status){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Question not found.");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body("Question deleted successfully");
    }
}
