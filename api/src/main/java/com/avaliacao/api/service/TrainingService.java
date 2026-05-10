package com.avaliacao.api.service;

import com.avaliacao.api.dtos.TrainingRecordDTO;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.repositories.TrainingRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TrainingService {

    private final TrainingRepository trainingRepository;

    public TrainingService(TrainingRepository trainingRepository){
        this.trainingRepository = trainingRepository;
    }

    public TrainingModel create(TrainingRecordDTO trainingRecordDTO){
        var training = new TrainingModel();
        BeanUtils.copyProperties(trainingRecordDTO,training);

        return trainingRepository.save(training);
    }

    public List<TrainingModel> findAll(){
        return trainingRepository.findAll();
    }

    public Optional<TrainingModel> findById(UUID id){
        return trainingRepository.findById(id);
    }

    public Optional<TrainingModel> update(UUID id, TrainingRecordDTO trainingRecordDTO){
        var trainingO = trainingRepository.findById(id);

        if(trainingO.isEmpty()){
            return Optional.empty();
        }

        var training = trainingO.get();
        BeanUtils.copyProperties(trainingRecordDTO,training);

        return Optional.of(trainingRepository.save(training));

    }

    public boolean delete(UUID id){
        var trainingO = trainingRepository.findById(id);

        if(trainingO.isEmpty()){
            return false;
        }

        trainingRepository.delete(trainingO.get());
        return true;

    }

}
