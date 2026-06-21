package com.avaliacao.api.models;


import jakarta.persistence.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "TB_TRAINING")
public class TrainingModel implements Serializable {
    private static final long serialVersionUID = 1L;
    // número de controle de versão de cada uma das classes que são serializadas

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idTraining; // o id é gerado sozinho
    private String title;
    private String initDate;
    private String endDate;
    private int workload;
    private String description;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String trainingImage;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private UserModel manager;

    @ManyToMany
    @JoinTable(
            name = "TB_TRAINING_USERS",
            joinColumns = @JoinColumn(name = "training_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<UserModel> users = new HashSet<>();

    public UUID getIdTraining() {
        return idTraining;
    }

    public void setIdTraining(UUID idTraining) {
        this.idTraining = idTraining;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public int getWorkload() {
        return workload;
    }

    public void setWorkload(int workload) {
        this.workload = workload;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTrainingImage() {
        return trainingImage;
    }

    public void setTrainingImage(String trainingImage) {
        this.trainingImage = trainingImage;
    }

    public Set<UserModel> getUsers() {
        return users;
    }

    public void setUsers(Set<UserModel> users) {
        this.users = users;
    }

    public UserModel getManager() {
        return manager;
    }

    public void setManager(UserModel manager) {
        this.manager = manager;
    }
}
