package com.avaliacao.api.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRecordDTO(@NotBlank(message = "Email e obrigatorio")
                             @Email(message = "Email invalido") String email,
                             @NotBlank(message = "Senha e obrigatoria") String passWord) {
}
