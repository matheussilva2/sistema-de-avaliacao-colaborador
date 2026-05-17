package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record LoginRecordDTO(@NotBlank String email,
                             @NotBlank String passWord) {
}
