package com.avaliacao.api.repositories;

import com.avaliacao.api.models.AlternativeModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlternativeRepository extends JpaRepository<AlternativeModel, UUID> {
    List<AlternativeModel> findByQuestionIdQuestion(UUID questionId);
}
