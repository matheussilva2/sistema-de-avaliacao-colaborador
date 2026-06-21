package com.avaliacao.api.dtos;

import com.avaliacao.api.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UserRecordDTO(
        @NotBlank(message = "Nome e obrigatorio") String name,
        @NotBlank(message = "Sobrenome e obrigatorio") String lastName,
        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido") String email,
        @NotBlank(message = "Senha e obrigatoria")
        @Size(min = 8, message = "Senha deve ter no minimo 8 caracteres") String passWord,
        @NotBlank(message = "Telefone e obrigatorio") String phone,
        @NotBlank(message = "CPF e obrigatorio") String cpf,
        @JsonFormat(pattern = "dd/MM/yyyy")
        @NotNull(message = "Data de contratacao e obrigatoria") LocalDate hireDate,
        @JsonFormat(pattern = "dd/MM/yyyy")
        @NotNull(message = "Data de registro e obrigatoria") LocalDate registrationDate,
        @NotNull(message = "Tipo de usuario e obrigatorio") UserRole userRole,
        @NotNull(message = "Status ativo e obrigatorio") Boolean active,
        UUID managerId
) {}
