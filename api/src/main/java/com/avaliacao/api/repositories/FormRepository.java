package com.avaliacao.api.repositories;

import com.avaliacao.api.models.FormModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormRepository extends JpaRepository<FormModel, UUID> {
    List<FormModel> findByTrainingIdTraining(UUID trainingId);
}
