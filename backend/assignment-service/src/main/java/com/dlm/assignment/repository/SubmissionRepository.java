package com.dlm.assignment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.assignment.entity.Submission;

public interface SubmissionRepository
        extends JpaRepository<
        Submission,
        Long> {

    List<Submission>
    findByAssignmentId(
            Long assignmentId);

    List<Submission>
    findByLearnerId(
            Long learnerId);
}
