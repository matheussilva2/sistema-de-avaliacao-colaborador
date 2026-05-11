package com.avaliacao.api.dtos;

import com.avaliacao.api.enums.FormType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FormRecordDTO(@NotBlank String title,
                            @NotNull FormType formType,
                            @NotBlank String initDate,
                            @NotBlank String endDate,
                            @NotNull int minCorrectPercentage) {
}
