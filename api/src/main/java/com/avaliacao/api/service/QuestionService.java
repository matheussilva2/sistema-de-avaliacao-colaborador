package com.avaliacao.api.service;

import com.avaliacao.api.dtos.QuestionRecordDTO;
import com.avaliacao.api.models.QuestionModel;
import com.avaliacao.api.repositories.FormRepository;
import com.avaliacao.api.repositories.QuestionRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final FormRepository formRepository;

    public QuestionService(QuestionRepository questionRepository, FormRepository formRepository){
        this.questionRepository = questionRepository;
        this.formRepository = formRepository;
    }

    public Optional<QuestionModel> create(UUID formId, QuestionRecordDTO questionRecordDTO){
        var formO = formRepository.findById(formId);

        if(formO.isEmpty()){
            return Optional.empty();
        }

        var question = new QuestionModel();
        BeanUtils.copyProperties(questionRecordDTO,question);
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
        BeanUtils.copyProperties(questionRecordDTO,question);

        return Optional.of(questionRepository.save(question));
    }

    public boolean delete(UUID id){
        var questionO = questionRepository.findById(id);

        if(questionO.isEmpty()){
            return false;
        }

        questionRepository.delete(questionO.get());
        return true;
    }
}
