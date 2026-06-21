package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record QuestionRecordDTO(@NotBlank(message = "Pergunta e obrigatoria") String title) {
}
