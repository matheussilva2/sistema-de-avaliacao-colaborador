package com.avaliacao.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "TB_ALTERNATIVES")
public class AlternativeModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idAlternative;

    private String text;
    private boolean correct;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "question_id")
    private QuestionModel question;

    public UUID getIdAlternative() {
        return idAlternative;
    }

    public void setIdAlternative(UUID idAlternative) {
        this.idAlternative = idAlternative;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public QuestionModel getQuestion() {
        return question;
    }

    public void setQuestion(QuestionModel question) {
        this.question = question;
    }
}
