package com.dlm.certification.dto;

import lombok.Data;

@Data
public class CourseResponse {

    private Long id;

    private String title;

    private String description;

    private String level;

    private String status;

    private Long categoryId;

    private Long ownerUserId;
}