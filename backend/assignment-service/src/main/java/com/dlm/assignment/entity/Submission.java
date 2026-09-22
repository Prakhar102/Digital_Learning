package com.dlm.assignment.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "submissions")

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(
            strategy =
            GenerationType.IDENTITY)
    private Long id;

    private Long assignmentId;

    private Long learnerId;

    @Column(length = 5000)
    private String submissionText;

    private String fileUrl;

    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    private Integer marks;

    @Column(length = 3000)
    private String feedback;

    private LocalDateTime gradedAt;
}