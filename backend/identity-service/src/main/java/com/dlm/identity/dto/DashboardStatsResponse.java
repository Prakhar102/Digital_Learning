package com.dlm.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private Long enrolledCourses;

    private Long completedAssessments;

    private Long certificatesEarned;

    private Long learningHours;
}