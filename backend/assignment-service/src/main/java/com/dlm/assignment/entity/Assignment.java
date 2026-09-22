package com.dlm.assignment.entity;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {

    @Id
    @GeneratedValue(
            strategy =
            GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String description;

    private Long courseId;

    private Long instructorId;

    private Integer maxMarks;

    private LocalDateTime dueDate;

    private LocalDateTime createdAt;

    private String assignmentFileUrl;

    private String assignmentFileName;

}