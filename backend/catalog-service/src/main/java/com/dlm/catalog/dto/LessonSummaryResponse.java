package com.dlm.catalog.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LessonSummaryResponse {

    private Long id;
    private String title;
    private Integer durationInMinutes;
}