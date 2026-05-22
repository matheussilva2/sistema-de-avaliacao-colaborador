package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record TrainingImageRecordDTO(@NotBlank String trainingImage) {
}
