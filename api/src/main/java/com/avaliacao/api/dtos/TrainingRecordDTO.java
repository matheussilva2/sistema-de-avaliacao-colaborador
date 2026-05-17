package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TrainingRecordDTO(@NotBlank String title,
                               @NotBlank String initDate,
                               @NotBlank String endDate,
                               @NotNull int workload,
                               @NotBlank String description,
                               UUID managerId) {}
// Tags de Validação
// Jacart Validation
// @NotBlank
//@NotNull
