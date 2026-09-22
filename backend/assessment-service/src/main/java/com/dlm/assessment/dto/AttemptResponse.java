package com.dlm.assessment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttemptResponse {

    private Long userId;

    private Long assessmentId;

    private Integer score;

    private Boolean passed;
}