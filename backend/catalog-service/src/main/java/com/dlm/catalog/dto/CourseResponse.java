package com.dlm.catalog.dto;

import com.dlm.catalog.entity.CourseLevel;
import com.dlm.catalog.entity.CourseStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {

    private Long id;

    private String title;

    private String description;

    private CourseLevel level;

    private CourseStatus status;

    private Long categoryId;

    private Long ownerUserId;
}