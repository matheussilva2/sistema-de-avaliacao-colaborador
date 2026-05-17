package com.avaliacao.api.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record FormAnswerRecordDTO(
        @NotEmpty List<@Valid QuestionAnswerRecordDTO> answers) {
}
