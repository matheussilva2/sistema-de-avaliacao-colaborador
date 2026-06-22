package com.avaliacao.api.models;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "TB_FORM_ATTEMPTS")
public class FormAttemptModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idAttempt;

    private LocalDateTime startedAt;

    @ManyToOne
    @JoinColumn(name = "form_id")
    private FormModel form;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserModel user;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<FormAttemptQuestionModel> questions = new ArrayList<>();

    public UUID getIdAttempt() {
        return idAttempt;
    }

    public void setIdAttempt(UUID idAttempt) {
        this.idAttempt = idAttempt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
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

    public List<FormAttemptQuestionModel> getQuestions() {
        return questions;
    }

    public void setQuestions(List<FormAttemptQuestionModel> questions) {
        this.questions = questions;
    }
}
