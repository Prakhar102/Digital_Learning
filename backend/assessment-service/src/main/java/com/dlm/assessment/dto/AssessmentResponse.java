package com.dlm.assessment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssessmentResponse {

    private Long id;

    private String title;

    private Long courseId;

    private Integer passingMarks;
}