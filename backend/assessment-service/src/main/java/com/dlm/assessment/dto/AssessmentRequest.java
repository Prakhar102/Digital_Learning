package com.dlm.assessment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssessmentRequest {

    @NotBlank
    private String title;

    @NotNull
    private Long courseId;

    @NotNull
    private Integer passingMarks;
}