package com.avaliacao.api.service;

import com.avaliacao.api.dtos.FormRecordDTO;
import com.avaliacao.api.models.FormModel;
import com.avaliacao.api.repositories.FormRepository;
import com.avaliacao.api.repositories.TrainingRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FormService {

    private final FormRepository formRepository;
    private final TrainingRepository trainingRepository;

    public FormService(FormRepository formRepository, TrainingRepository trainingRepository){
        this.formRepository = formRepository;
        this.trainingRepository = trainingRepository;
    }

    public Optional<FormModel> create(UUID trainingId, FormRecordDTO formRecordDTO){
        var trainingO = trainingRepository.findById(trainingId);

        if(trainingO.isEmpty()){
            return Optional.empty();
        }

        var form = new FormModel();
        BeanUtils.copyProperties(formRecordDTO,form);
        form.setTraining(trainingO.get());

        return Optional.of(formRepository.save(form));
    }

    public List<FormModel> findAll(){
        return formRepository.findAll();
    }

    public Optional<FormModel> findById(UUID id){
        return formRepository.findById(id);
    }

    public Optional<List<FormModel>> findByTraining(UUID trainingId){
        var trainingO = trainingRepository.findById(trainingId);

        if(trainingO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formRepository.findByTrainingIdTraining(trainingId));
    }

    public Optional<FormModel> update(UUID id, FormRecordDTO formRecordDTO){
        var formO = formRepository.findById(id);

        if(formO.isEmpty()){
            return Optional.empty();
        }

        var form = formO.get();
        BeanUtils.copyProperties(formRecordDTO,form);

        return Optional.of(formRepository.save(form));
    }

    public boolean delete(UUID id){
        var formO = formRepository.findById(id);

        if(formO.isEmpty()){
            return false;
        }

        formRepository.delete(formO.get());
        return true;
    }
}
