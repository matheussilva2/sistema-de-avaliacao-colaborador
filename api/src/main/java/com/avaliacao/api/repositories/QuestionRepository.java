package com.avaliacao.api.repositories;

import com.avaliacao.api.models.QuestionModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionModel, UUID> {
    List<QuestionModel> findByFormIdForm(UUID formId);
}
