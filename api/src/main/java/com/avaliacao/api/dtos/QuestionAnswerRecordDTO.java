package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record QuestionAnswerRecordDTO(@NotNull UUID questionId,
                                      @NotNull UUID alternativeId) {
}
