package com.avaliacao.api.repositories;

import com.avaliacao.api.models.QuestionAnswerModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionAnswerRepository extends JpaRepository<QuestionAnswerModel, UUID> {
    List<QuestionAnswerModel> findByFormAnswerIdAnswer(UUID answerId);
}
