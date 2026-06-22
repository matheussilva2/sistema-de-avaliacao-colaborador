package com.avaliacao.api.dtos;

import java.util.UUID;

public record AttemptAlternativeResponseDTO(UUID idAlternative,
                                            String text,
                                            Boolean correct) {
}
