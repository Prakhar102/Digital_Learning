package com.dlm.catalog.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModuleDetailsResponse {

    private Long id;
    private String title;
    private Integer sequenceNumber;

    private List<LessonSummaryResponse> lessons;
}