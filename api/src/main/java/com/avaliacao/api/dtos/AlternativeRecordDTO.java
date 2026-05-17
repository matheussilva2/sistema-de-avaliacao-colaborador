package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AlternativeRecordDTO(@NotBlank String text,
                                   @NotNull boolean correct) {
}
