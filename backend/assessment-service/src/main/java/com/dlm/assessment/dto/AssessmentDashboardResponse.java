package com.dlm.assessment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssessmentDashboardResponse {

    private Long totalAttempts;

    private Double averageScore;

    private Integer highestScore;

    private Double passPercentage;
}