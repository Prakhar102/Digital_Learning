package com.dlm.assessment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.assessment.entity.StudentAttempt;

public interface StudentAttemptRepository
        extends JpaRepository<StudentAttempt, Long> {

    List<StudentAttempt> findByUserId(Long userId);

    long countByAssessmentId(Long assessmentId);

    long countByAssessmentIdAndPassed(Long assessmentId,Boolean passed);

    List<StudentAttempt> findByAssessmentId(Long assessmentId);

}