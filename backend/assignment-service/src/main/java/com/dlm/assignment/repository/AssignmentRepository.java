package com.dlm.assignment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.assignment.entity.Assignment;

public interface AssignmentRepository
        extends JpaRepository<
        Assignment,
        Long> {

    List<Assignment>
    findByInstructorId(
            Long instructorId);

    List<Assignment>
    findByCourseId(
            Long courseId);
}