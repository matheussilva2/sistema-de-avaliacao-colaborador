package com.avaliacao.api.models;

import com.avaliacao.api.enums.FormType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "TB_FORMS")
public class FormModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idForm;

    private String title;

    @Enumerated(EnumType.STRING)
    private FormType formType;

    private String initDate;
    private String endDate;
    private String initTime;
    private String endTime;
    private int minCorrectPercentage;
    private int questionsToDraw;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "training_id")
    private TrainingModel training;

    public UUID getIdForm() {
        return idForm;
    }

    public void setIdForm(UUID idForm) {
        this.idForm = idForm;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public FormType getFormType() {
        return formType;
    }

    public void setFormType(FormType formType) {
        this.formType = formType;
    }

    public String getInitDate() {
        return initDate;
    }

    public void setInitDate(String initDate) {
        this.initDate = initDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getInitTime() {
        return initTime;
    }

    public void setInitTime(String initTime) {
        this.initTime = initTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public int getMinCorrectPercentage() {
        return minCorrectPercentage;
    }

    public void setMinCorrectPercentage(int minCorrectPercentage) {
        this.minCorrectPercentage = minCorrectPercentage;
    }

    public int getQuestionsToDraw() {
        return questionsToDraw;
    }

    public void setQuestionsToDraw(int questionsToDraw) {
        this.questionsToDraw = questionsToDraw;
    }

    public TrainingModel getTraining() {
        return training;
    }

    public void setTraining(TrainingModel training) {
        this.training = training;
    }
}
