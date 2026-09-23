package com.dlm.catalog.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LessonSummaryResponse {

    private Long id;
    private String title;
    private String contentType;
    private String contentRef;
    private String videoUrl;
    private String content;
    private Integer durationInMinutes;
    private Integer sequenceNumber;
    private Long moduleId;
}