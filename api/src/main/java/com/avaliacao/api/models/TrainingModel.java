package com.avaliacao.api.models;


import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "TB_TRAINING")
public class TrainingModel implements Serializable {
    private static final long serialVersionUID = 1L;
    // número de controle de versão de cada uma das classes que são serializadas

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID idProduct; // o id é gerado sozinho
    private String title;
    private String initDate;
    private String endDate;
    private int workload;
    private String description;

    public UUID getIdProduct() {
        return idProduct;
    }

    public void setIdProduct(UUID idProduct) {
        this.idProduct = idProduct;
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
}
