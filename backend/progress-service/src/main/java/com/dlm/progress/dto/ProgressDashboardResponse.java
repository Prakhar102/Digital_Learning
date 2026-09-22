package com.dlm.progress.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgressDashboardResponse {

    private Long totalCourses;

    private Long completedCourses;

    private Long inProgressCourses;
}