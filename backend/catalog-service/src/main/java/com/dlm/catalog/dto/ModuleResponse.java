package com.dlm.catalog.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModuleResponse {

    private Long id;

    private String title;

    private Integer sequenceNumber;

    private Long courseId;

    private List<LessonResponse> lessons;
}