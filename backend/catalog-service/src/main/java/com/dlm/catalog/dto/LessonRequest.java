package com.dlm.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String contentType;

    private String contentRef;

    @NotNull
    private Integer durationInMinutes;

    @NotNull
    private Integer sequenceNumber;

    @NotNull
    private Long moduleId;
}