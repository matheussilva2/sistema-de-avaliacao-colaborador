package com.avaliacao.api.service;

import com.avaliacao.api.dtos.TrainingImageRecordDTO;
import com.avaliacao.api.dtos.TrainingRecordDTO;
import com.avaliacao.api.enums.UserRole;
import com.avaliacao.api.exceptions.FieldValidationException;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.models.UserModel;
import com.avaliacao.api.repositories.FormAnswerRepository;
import com.avaliacao.api.repositories.TrainingRepository;
import com.avaliacao.api.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;
    private final FormAnswerRepository formAnswerRepository;

    public TrainingService(TrainingRepository trainingRepository,
                           UserRepository userRepository,
                           FormAnswerRepository formAnswerRepository){
        this.trainingRepository = trainingRepository;
        this.userRepository = userRepository;
        this.formAnswerRepository = formAnswerRepository;
    }

    public TrainingModel create(TrainingRecordDTO trainingRecordDTO){
        validateTraining(trainingRecordDTO);

        var training = new TrainingModel();
        BeanUtils.copyProperties(trainingRecordDTO,training);
        applyNormalizedFields(training, trainingRecordDTO);
        setManagerIfPresent(training, trainingRecordDTO.managerId());

        return trainingRepository.save(training);
    }

    public TrainingModel createForManager(UUID managerId, TrainingRecordDTO trainingRecordDTO){
        validateTraining(trainingRecordDTO);

        var manager = getManagerOrThrow(managerId);
        var training = new TrainingModel();

        BeanUtils.copyProperties(trainingRecordDTO,training);
        applyNormalizedFields(training, trainingRecordDTO);
        training.setManager(manager);

        return trainingRepository.save(training);
    }

    public List<TrainingModel> findAll(){
        return trainingRepository.findAll();
    }

    public List<TrainingModel> findByManager(UUID managerId){
        getManagerOrThrow(managerId);
        return trainingRepository.findByManager_Id(managerId);
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
        validateTraining(trainingRecordDTO);
        BeanUtils.copyProperties(trainingRecordDTO,training);
        applyNormalizedFields(training, trainingRecordDTO);
        setManagerIfPresent(training, trainingRecordDTO.managerId());

        return Optional.of(trainingRepository.save(training));

    }

    public Optional<TrainingModel> updateImage(UUID id, TrainingImageRecordDTO trainingImageRecordDTO){
        var trainingO = trainingRepository.findById(id);

        if(trainingO.isEmpty()){
            return Optional.empty();
        }

        var training = trainingO.get();
        training.setTrainingImage(trainingImageRecordDTO.trainingImage());

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

        if(formAnswerRepository.existsByFormTrainingIdTrainingAndUserId(trainingId,userId)){
            var errors = new LinkedHashMap<String, String>();
            errors.put("userId", "Colaborador ja iniciou o treinamento");
            throw new FieldValidationException(errors);
        }

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

    private UserModel getManagerOrThrow(UUID managerId){
        var managerO = userRepository.findById(managerId);

        if(managerO.isEmpty() || managerO.get().getUserRole() != UserRole.MANAGER){
            throw new IllegalArgumentException("Manager not found.");
        }

        return managerO.get();
    }

    private void setManagerIfPresent(TrainingModel training, UUID managerId){
        if(managerId == null){
            return;
        }

        training.setManager(getManagerOrThrow(managerId));
    }

    private void validateTraining(TrainingRecordDTO trainingRecordDTO){
        var errors = new LinkedHashMap<String, String>();
        var initDate = parseDate(trainingRecordDTO.initDate());
        var endDate = parseDate(trainingRecordDTO.endDate());

        if(initDate == null){
            errors.put("initDate", "Data de inicio invalida");
        }

        if(endDate == null){
            errors.put("endDate", "Data de termino invalida");
        }

        if(initDate != null && endDate != null && endDate.isBefore(initDate)){
            errors.put("endDate", "Data de termino deve ser posterior ou igual a data de inicio");
        }

        if(!errors.isEmpty()){
            throw new FieldValidationException(errors);
        }
    }

    private void applyNormalizedFields(TrainingModel training, TrainingRecordDTO trainingRecordDTO){
        training.setTitle(trainingRecordDTO.title().trim());
        training.setInitDate(trainingRecordDTO.initDate().trim());
        training.setEndDate(trainingRecordDTO.endDate().trim());
        training.setDescription(trainingRecordDTO.description().trim());
    }

    private LocalDate parseDate(String value){
        if(value == null || value.isBlank()){
            return null;
        }

        var trimmedValue = value.trim();

        try {
            return LocalDate.parse(trimmedValue, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDate.parse(trimmedValue, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (DateTimeParseException ignored) {
        }

        if(trimmedValue.matches("\\d{2}/\\d{2}")){
            try {
                var parts = trimmedValue.split("/");
                return LocalDate.of(
                        LocalDate.now().getYear(),
                        Integer.parseInt(parts[1]),
                        Integer.parseInt(parts[0]));
            } catch (DateTimeException | NumberFormatException ignored) {
            }
        }

        return null;
    }
}
