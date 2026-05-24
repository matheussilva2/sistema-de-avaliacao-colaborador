package com.avaliacao.api.dtos;

import com.avaliacao.api.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;

import java.time.LocalDate;
import java.util.UUID;

public record UserRecordDTO(
        @NotBlank String name,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String passWord,
        @NotBlank String phone,
        @NotBlank String cpf,
        @NotNull LocalDate hireDate,
        @NotNull LocalDate registrationDate,
        @NotNull UserRole userRole,
        @NotNull Boolean active,
        UUID managerId
) {}
