package com.avaliacao.api.exceptions;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public class FieldValidationException extends RuntimeException {
    private final Map<String, String> errors;

    public FieldValidationException(Map<String, String> errors){
        this.errors = Collections.unmodifiableMap(new LinkedHashMap<>(errors));
    }

    public Map<String, String> getErrors(){
        return errors;
    }
}
