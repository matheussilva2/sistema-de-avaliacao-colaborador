package com.avaliacao.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "TB_FORM_ATTEMPT_QUESTIONS")
public class FormAttemptQuestionModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idAttemptQuestion;

    private int displayOrder;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "attempt_id")
    private FormAttemptModel attempt;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private QuestionModel question;

    @OneToMany(mappedBy = "attemptQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<FormAttemptAlternativeModel> alternatives = new ArrayList<>();

    public UUID getIdAttemptQuestion() {
        return idAttemptQuestion;
    }

    public void setIdAttemptQuestion(UUID idAttemptQuestion) {
        this.idAttemptQuestion = idAttemptQuestion;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public FormAttemptModel getAttempt() {
        return attempt;
    }

    public void setAttempt(FormAttemptModel attempt) {
        this.attempt = attempt;
    }

    public QuestionModel getQuestion() {
        return question;
    }

    public void setQuestion(QuestionModel question) {
        this.question = question;
    }

    public List<FormAttemptAlternativeModel> getAlternatives() {
        return alternatives;
    }

    public void setAlternatives(List<FormAttemptAlternativeModel> alternatives) {
        this.alternatives = alternatives;
    }
}
