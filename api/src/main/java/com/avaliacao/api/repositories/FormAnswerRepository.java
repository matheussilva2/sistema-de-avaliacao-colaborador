package com.avaliacao.api.repositories;

import com.avaliacao.api.models.FormAnswerModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormAnswerRepository extends JpaRepository<FormAnswerModel, UUID> {
    List<FormAnswerModel> findByFormIdForm(UUID formId);
    List<FormAnswerModel> findByUserId(UUID userId);
    List<FormAnswerModel> findByFormIdFormAndUserId(UUID formId, UUID userId);
    List<FormAnswerModel> findByFormTrainingIdTraining(UUID trainingId);
    List<FormAnswerModel> findByFormTrainingIdTrainingAndUserId(UUID trainingId, UUID userId);
    boolean existsByFormTrainingIdTrainingAndUserId(UUID trainingId, UUID userId);
}
