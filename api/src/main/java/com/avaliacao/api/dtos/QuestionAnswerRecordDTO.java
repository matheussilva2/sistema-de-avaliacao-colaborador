package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record QuestionAnswerRecordDTO(@NotNull(message = "Pergunta e obrigatoria") UUID questionId,
                                      @NotNull(message = "Alternativa e obrigatoria") UUID alternativeId) {
}
