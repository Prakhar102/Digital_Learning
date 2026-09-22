package com.dlm.assessment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Long courseId;

    private Integer passingMarks;
}