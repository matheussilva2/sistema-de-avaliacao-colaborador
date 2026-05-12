package com.avaliacao.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "TB_QUESTION_ANSWERS")
public class QuestionAnswerModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idQuestionAnswer;

    private boolean correct;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "form_answer_id")
    private FormAnswerModel formAnswer;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private QuestionModel question;

    @ManyToOne
    @JoinColumn(name = "alternative_id")
    private AlternativeModel selectedAlternative;

    public UUID getIdQuestionAnswer() {
        return idQuestionAnswer;
    }

    public void setIdQuestionAnswer(UUID idQuestionAnswer) {
        this.idQuestionAnswer = idQuestionAnswer;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public FormAnswerModel getFormAnswer() {
        return formAnswer;
    }

    public void setFormAnswer(FormAnswerModel formAnswer) {
        this.formAnswer = formAnswer;
    }

    public QuestionModel getQuestion() {
        return question;
    }

    public void setQuestion(QuestionModel question) {
        this.question = question;
    }

    public AlternativeModel getSelectedAlternative() {
        return selectedAlternative;
    }

    public void setSelectedAlternative(AlternativeModel selectedAlternative) {
        this.selectedAlternative = selectedAlternative;
    }
}
