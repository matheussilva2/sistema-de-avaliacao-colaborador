package com.avaliacao.api.controller;

import com.avaliacao.api.exceptions.FieldValidationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception){

        var errors = new LinkedHashMap<String, String>();

        for(FieldError fieldError : exception.getBindingResult().getFieldErrors()){
            errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }

        if(errors.isEmpty()){
            errors.put("body", "Dados da requisicao invalidos.");
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(FieldValidationException.class)
    public ResponseEntity<Map<String, String>> handleFieldValidation(
            FieldValidationException exception){

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getErrors());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleMessageNotReadable(){
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("body", "JSON invalido ou campo com tipo incorreto."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleArgumentTypeMismatch(
            MethodArgumentTypeMismatchException exception){

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(exception.getName(), "Valor invalido"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(){
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("email", "Ja existe uma conta cadastrada com esse email"));
    }
}
