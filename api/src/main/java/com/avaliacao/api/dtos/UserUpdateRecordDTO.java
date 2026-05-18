package com.avaliacao.api.dtos;

import com.avaliacao.api.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UserUpdateRecordDTO(
        @NotBlank String name,
        @NotBlank String lastName,
        @NotBlank String email,
        String passWord,
        @NotBlank String phone,
        @NotBlank String cpf,
        @NotNull UserRole userRole,
        @NotNull Boolean active,
        UUID managerId
) {}
