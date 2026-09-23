package com.dlm.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModuleRequest {

    @NotBlank
    private String title;

    private Integer sequenceNumber;

    private Integer orderIndex;

    @NotNull
    private Long courseId;
}