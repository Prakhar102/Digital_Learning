package com.dlm.progress.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgressResponse {

    private Long userId;

    private Long courseId;

    private Integer completedLessons;

    private Integer totalLessons;

    private Double completionPercentage;

    private Boolean completed;
}