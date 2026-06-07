package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record UserPhotoRecordDTO(
        @NotBlank(message = "Foto de perfil e obrigatoria") String profilePhoto) {
}
