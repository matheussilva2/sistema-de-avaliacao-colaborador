package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record TrainingImageRecordDTO(
        @NotBlank(message = "Imagem do treinamento e obrigatoria") String trainingImage) {
}
