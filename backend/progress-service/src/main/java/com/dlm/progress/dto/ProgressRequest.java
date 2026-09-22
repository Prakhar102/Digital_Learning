package com.dlm.progress.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProgressRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long courseId;

    @NotNull
    private Integer completedLessons;

    @NotNull
    private Integer totalLessons;
}