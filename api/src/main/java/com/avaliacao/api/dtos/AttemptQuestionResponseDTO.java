package com.avaliacao.api.dtos;

import java.util.List;
import java.util.UUID;

public record AttemptQuestionResponseDTO(UUID idQuestion,
                                         String title,
                                         List<AttemptAlternativeResponseDTO> alternatives) {
}
