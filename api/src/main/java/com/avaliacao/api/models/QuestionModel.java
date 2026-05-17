package com.avaliacao.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "TB_QUESTIONS")
public class QuestionModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idQuestion;

    private String title;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "form_id")
    private FormModel form;

    public UUID getIdQuestion() {
        return idQuestion;
    }

    public void setIdQuestion(UUID idQuestion) {
        this.idQuestion = idQuestion;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public FormModel getForm() {
        return form;
    }

    public void setForm(FormModel form) {
        this.form = form;
    }
}
