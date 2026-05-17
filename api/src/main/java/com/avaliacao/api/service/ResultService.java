package com.avaliacao.api.service;

import com.avaliacao.api.models.FormAnswerModel;
import com.avaliacao.api.repositories.FormAnswerRepository;
import com.avaliacao.api.repositories.FormRepository;
import com.avaliacao.api.repositories.TrainingRepository;
import com.avaliacao.api.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResultService {

    private final FormAnswerRepository formAnswerRepository;
    private final UserRepository userRepository;
    private final FormRepository formRepository;
    private final TrainingRepository trainingRepository;

    public ResultService(FormAnswerRepository formAnswerRepository,
                         UserRepository userRepository,
                         FormRepository formRepository,
                         TrainingRepository trainingRepository){
        this.formAnswerRepository = formAnswerRepository;
        this.userRepository = userRepository;
        this.formRepository = formRepository;
        this.trainingRepository = trainingRepository;
    }

    public Optional<List<FormAnswerModel>> findByUser(UUID userId){
        var userO = userRepository.findById(userId);

        if(userO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formAnswerRepository.findByUserId(userId));
    }

    public Optional<List<FormAnswerModel>> findByForm(UUID formId){
        var formO = formRepository.findById(formId);

        if(formO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formAnswerRepository.findByFormIdForm(formId));
    }

    public Optional<List<FormAnswerModel>> findByTraining(UUID trainingId){
        var trainingO = trainingRepository.findById(trainingId);

        if(trainingO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formAnswerRepository.findByFormTrainingIdTraining(trainingId));
    }

    public Optional<List<FormAnswerModel>> findByTrainingAndUser(UUID trainingId, UUID userId){
        var trainingO = trainingRepository.findById(trainingId);
        var userO = userRepository.findById(userId);

        if(trainingO.isEmpty() || userO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formAnswerRepository.findByFormTrainingIdTrainingAndUserId(trainingId,userId));
    }
}
