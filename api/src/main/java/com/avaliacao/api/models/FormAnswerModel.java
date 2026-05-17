package com.avaliacao.api.models;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "TB_FORM_ANSWERS")
public class FormAnswerModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idAnswer;

    private LocalDateTime answeredAt;
    private int correctAnswers;
    private int totalQuestions;
    private int scorePercentage;
    private boolean approved;

    @ManyToOne
    @JoinColumn(name = "form_id")
    private FormModel form;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserModel user;

    @OneToMany(mappedBy = "formAnswer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<QuestionAnswerModel> questionAnswers = new HashSet<>();

    public UUID getIdAnswer() {
        return idAnswer;
    }

    public void setIdAnswer(UUID idAnswer) {
        this.idAnswer = idAnswer;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getScorePercentage() {
        return scorePercentage;
    }

    public void setScorePercentage(int scorePercentage) {
        this.scorePercentage = scorePercentage;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public FormModel getForm() {
        return form;
    }

    public void setForm(FormModel form) {
        this.form = form;
    }

    public UserModel getUser() {
        return user;
    }

    public void setUser(UserModel user) {
        this.user = user;
    }

    public Set<QuestionAnswerModel> getQuestionAnswers() {
        return questionAnswers;
    }

    public void setQuestionAnswers(Set<QuestionAnswerModel> questionAnswers) {
        this.questionAnswers = questionAnswers;
    }
}
