package com.avaliacao.api.dtos;

import com.avaliacao.api.enums.FormType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FormRecordDTO(@NotBlank(message = "Titulo e obrigatorio") String title,
                            @NotNull(message = "Tipo de formulario e obrigatorio") FormType formType,
                            @NotBlank(message = "Data de inicio e obrigatoria") String initDate,
                            @NotBlank(message = "Data de termino e obrigatoria") String endDate,
                            @NotBlank(message = "Horario de inicio e obrigatorio") String initTime,
                            @NotBlank(message = "Horario de termino e obrigatorio") String endTime,
                            @NotNull(message = "Percentual minimo e obrigatorio")
                            @Min(value = 0, message = "Percentual minimo nao pode ser menor que 0")
                            @Max(value = 100, message = "Percentual minimo nao pode ser maior que 100")
                            Integer minCorrectPercentage) {
}
