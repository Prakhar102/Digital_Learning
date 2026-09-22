package com.dlm.catalog.dto;

import com.dlm.catalog.entity.CourseLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private CourseLevel level;

    @NotNull
    private Long categoryId;

    @NotNull
    private Long ownerUserId;
}