package com.dlm.assignment.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionRequest {

    private Long assignmentId;

    private Long learnerId;

    private String submissionText;

    private String fileUrl;
}