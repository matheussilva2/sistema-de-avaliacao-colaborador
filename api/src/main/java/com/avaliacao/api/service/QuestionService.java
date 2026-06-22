package com.avaliacao.api.service;

import com.avaliacao.api.dtos.QuestionRecordDTO;
import com.avaliacao.api.exceptions.FieldValidationException;
import com.avaliacao.api.models.QuestionModel;
import com.avaliacao.api.repositories.FormRepository;
import com.avaliacao.api.repositories.QuestionRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final FormRepository formRepository;
    private final FormAttemptService formAttemptService;

    public QuestionService(QuestionRepository questionRepository,
                           FormRepository formRepository,
                           FormAttemptService formAttemptService){
        this.questionRepository = questionRepository;
        this.formRepository = formRepository;
        this.formAttemptService = formAttemptService;
    }

    public Optional<QuestionModel> create(UUID formId, QuestionRecordDTO questionRecordDTO){
        var formO = formRepository.findById(formId);

        if(formO.isEmpty()){
            return Optional.empty();
        }

        ensureFormHasNoAttempts(formId);

        var question = new QuestionModel();
        BeanUtils.copyProperties(questionRecordDTO,question);
        question.setTitle(questionRecordDTO.title().trim());
        question.setForm(formO.get());

        return Optional.of(questionRepository.save(question));
    }

    public List<QuestionModel> findAll(){
        return questionRepository.findAll();
    }

    public Optional<QuestionModel> findById(UUID id){
        return questionRepository.findById(id);
    }

    public Optional<List<QuestionModel>> findByForm(UUID formId){
        var formO = formRepository.findById(formId);

        if(formO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(questionRepository.findByFormIdForm(formId));
    }

    public Optional<QuestionModel> update(UUID id, QuestionRecordDTO questionRecordDTO){
        var questionO = questionRepository.findById(id);

        if(questionO.isEmpty()){
            return Optional.empty();
        }

        var question = questionO.get();
        ensureFormHasNoAttempts(question.getForm().getIdForm());
        BeanUtils.copyProperties(questionRecordDTO,question);
        question.setTitle(questionRecordDTO.title().trim());

        return Optional.of(questionRepository.save(question));
    }

    public boolean delete(UUID id){
        var questionO = questionRepository.findById(id);

        if(questionO.isEmpty()){
            return false;
        }

        ensureFormHasNoAttempts(questionO.get().getForm().getIdForm());
        questionRepository.delete(questionO.get());
        return true;
    }

    private void ensureFormHasNoAttempts(UUID formId){
        if(!formAttemptService.existsByForm(formId)){
            return;
        }

        var errors = new LinkedHashMap<String, String>();
        errors.put("formId", "Formulario ja foi iniciado por colaboradores");
        throw new FieldValidationException(errors);
    }
}
