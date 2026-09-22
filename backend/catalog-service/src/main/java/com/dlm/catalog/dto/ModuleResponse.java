package com.dlm.catalog.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModuleResponse {

    private Long id;

    private String title;

    private Integer sequenceNumber;

    private Long courseId;
}