package com.avaliacao.api.repositories;

import com.avaliacao.api.models.FormAttemptModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormAttemptRepository extends JpaRepository<FormAttemptModel, UUID> {
    List<FormAttemptModel> findByFormIdFormAndUserIdOrderByStartedAtDesc(UUID formId, UUID userId);
    boolean existsByFormIdForm(UUID formId);
    boolean existsByFormTrainingIdTrainingAndUserId(UUID trainingId, UUID userId);
}
