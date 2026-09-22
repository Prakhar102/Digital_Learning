package com.dlm.assignment.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentResponse {

    private Long id;

    private String title;

    private String description;

    private Long courseId;

    private Long instructorId;

    private Integer maxMarks;

    private LocalDateTime dueDate;

    private LocalDateTime createdAt;

    private String assignmentFileUrl;

    private String assignmentFileName;
}