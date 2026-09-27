package com.dlm.assessment.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AttemptResponse {

    private Long userId;

    private Long assessmentId;

    private Integer score;

    private Boolean passed;

    private LocalDateTime attemptedAt;
}
