package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record TrainingRecordDTO(
        @NotBlank(message = "Titulo e obrigatorio") String title,
        @NotBlank(message = "Data de inicio e obrigatoria") String initDate,
        @NotBlank(message = "Data de termino e obrigatoria") String endDate,
        @NotNull(message = "Carga horaria e obrigatoria")
        @Positive(message = "Carga horaria deve ser maior que zero") Integer workload,
        @NotBlank(message = "Descricao e obrigatoria") String description,
        UUID managerId
) {}
