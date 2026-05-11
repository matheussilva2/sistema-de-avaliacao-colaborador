package com.avaliacao.api.service;

import com.avaliacao.api.dtos.TrainingRecordDTO;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.models.UserModel;
import com.avaliacao.api.repositories.TrainingRepository;
import com.avaliacao.api.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;

    public TrainingService(TrainingRepository trainingRepository, UserRepository userRepository){
        this.trainingRepository = trainingRepository;
        this.userRepository = userRepository;
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

    @Transactional
    public Optional<TrainingModel> addUser(UUID trainingId, UUID userId){
        var trainingO = trainingRepository.findById(trainingId);
        var userO = userRepository.findById(userId);

        if(trainingO.isEmpty() || userO.isEmpty()){
            return Optional.empty();
        }

        var training = trainingO.get();
        training.getUsers().add(userO.get());

        return Optional.of(trainingRepository.save(training));
    }

    @Transactional
    public Optional<TrainingModel> removeUser(UUID trainingId, UUID userId){
        var trainingO = trainingRepository.findById(trainingId);
        var userO = userRepository.findById(userId);

        if(trainingO.isEmpty() || userO.isEmpty()){
            return Optional.empty();
        }

        var training = trainingO.get();
        training.getUsers().remove(userO.get());

        return Optional.of(trainingRepository.save(training));
    }

    @Transactional
    public Optional<Set<UserModel>> findUsersByTraining(UUID trainingId){
        var trainingO = trainingRepository.findById(trainingId);

        if(trainingO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(trainingO.get().getUsers());
    }
}
