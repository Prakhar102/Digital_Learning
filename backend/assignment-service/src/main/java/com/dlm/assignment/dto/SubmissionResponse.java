package com.dlm.assignment.dto;

import java.time.LocalDateTime;

import com.dlm.assignment.entity.SubmissionStatus;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {

    private Long id;

    private Long assignmentId;

    private Long learnerId;

    private String submissionText;

    private String fileUrl;

    private LocalDateTime submittedAt;

    private SubmissionStatus status;

    private Integer marks;

    private String feedback;

    private LocalDateTime gradedAt;
}