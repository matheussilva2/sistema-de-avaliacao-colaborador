package com.avaliacao.api.dtos;

import com.avaliacao.api.enums.FormType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record FormAttemptResponseDTO(UUID idAttempt,
                                     UUID idForm,
                                     String title,
                                     FormType formType,
                                     String initDate,
                                     String endDate,
                                     String initTime,
                                     String endTime,
                                     int minCorrectPercentage,
                                     int questionsToDraw,
                                     int questionBankSize,
                                     LocalDateTime startedAt,
                                     List<AttemptQuestionResponseDTO> questions) {
}
