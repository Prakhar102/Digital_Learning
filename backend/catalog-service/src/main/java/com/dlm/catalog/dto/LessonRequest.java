package com.dlm.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonRequest {

    @NotBlank
    private String title;

    private String contentType;

    private String contentRef;

    private String videoUrl;

    private String content;

    private Integer durationInMinutes;

    private Integer sequenceNumber;

    private Integer orderIndex;

    @NotNull
    private Long moduleId;
}