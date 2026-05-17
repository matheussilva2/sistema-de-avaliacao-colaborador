package com.avaliacao.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record UserPhotoRecordDTO(@NotBlank String profilePhoto) {
}
