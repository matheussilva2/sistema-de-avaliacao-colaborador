package com.avaliacao.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "TB_FORM_ATTEMPT_ALTERNATIVES")
public class FormAttemptAlternativeModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idAttemptAlternative;

    private int displayOrder;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "attempt_question_id")
    private FormAttemptQuestionModel attemptQuestion;

    @ManyToOne
    @JoinColumn(name = "alternative_id")
    private AlternativeModel alternative;

    public UUID getIdAttemptAlternative() {
        return idAttemptAlternative;
    }

    public void setIdAttemptAlternative(UUID idAttemptAlternative) {
        this.idAttemptAlternative = idAttemptAlternative;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public FormAttemptQuestionModel getAttemptQuestion() {
        return attemptQuestion;
    }

    public void setAttemptQuestion(FormAttemptQuestionModel attemptQuestion) {
        this.attemptQuestion = attemptQuestion;
    }

    public AlternativeModel getAlternative() {
        return alternative;
    }

    public void setAlternative(AlternativeModel alternative) {
        this.alternative = alternative;
    }
}
