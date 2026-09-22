package com.dlm.assignment.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequest {

    private String title;

    private String description;

    private Long courseId;

    private Long instructorId;

    private Integer maxMarks;

    private LocalDateTime dueDate;

    private String assignmentFileUrl;

    private String assignmentFileName;
}