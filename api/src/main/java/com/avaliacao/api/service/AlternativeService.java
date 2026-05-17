package com.avaliacao.api.service;

import com.avaliacao.api.dtos.AlternativeRecordDTO;
import com.avaliacao.api.models.AlternativeModel;
import com.avaliacao.api.repositories.AlternativeRepository;
import com.avaliacao.api.repositories.QuestionRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AlternativeService {

    private final AlternativeRepository alternativeRepository;
    private final QuestionRepository questionRepository;

    public AlternativeService(AlternativeRepository alternativeRepository, QuestionRepository questionRepository){
        this.alternativeRepository = alternativeRepository;
        this.questionRepository = questionRepository;
    }

    public Optional<AlternativeModel> create(UUID questionId, AlternativeRecordDTO alternativeRecordDTO){
        var questionO = questionRepository.findById(questionId);

        if(questionO.isEmpty()){
            return Optional.empty();
        }

        var alternative = new AlternativeModel();
        BeanUtils.copyProperties(alternativeRecordDTO,alternative);
        alternative.setQuestion(questionO.get());

        return Optional.of(alternativeRepository.save(alternative));
    }

    public List<AlternativeModel> findAll(){
        return alternativeRepository.findAll();
    }

    public Optional<AlternativeModel> findById(UUID id){
        return alternativeRepository.findById(id);
    }

    public Optional<List<AlternativeModel>> findByQuestion(UUID questionId){
        var questionO = questionRepository.findById(questionId);

        if(questionO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(alternativeRepository.findByQuestionIdQuestion(questionId));
    }

    public Optional<AlternativeModel> update(UUID id, AlternativeRecordDTO alternativeRecordDTO){
        var alternativeO = alternativeRepository.findById(id);

        if(alternativeO.isEmpty()){
            return Optional.empty();
        }

        var alternative = alternativeO.get();
        BeanUtils.copyProperties(alternativeRecordDTO,alternative);

        return Optional.of(alternativeRepository.save(alternative));
    }

    public boolean delete(UUID id){
        var alternativeO = alternativeRepository.findById(id);

        if(alternativeO.isEmpty()){
            return false;
        }

        alternativeRepository.delete(alternativeO.get());
        return true;
    }
}
