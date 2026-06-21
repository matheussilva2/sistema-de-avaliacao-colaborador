package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AlternativeRecordDTO(@NotBlank(message = "Texto da alternativa e obrigatorio") String text,
                                   @NotNull(message = "Informe se a alternativa esta correta") Boolean correct) {
}
