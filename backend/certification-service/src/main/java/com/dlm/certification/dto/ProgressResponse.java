package com.dlm.certification.dto;

import lombok.Data;

@Data
public class ProgressResponse {

    private Long userId;

    private Long courseId;

    private Integer completedLessons;

    private Integer totalLessons;

    private Double completionPercentage;

    private Boolean completed;
}