package com.dlm.assignment.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.assignment.dto.AssignmentRequest;
import com.dlm.assignment.dto.AssignmentResponse;
import com.dlm.assignment.entity.Assignment;
import com.dlm.assignment.repository.AssignmentRepository;
import com.dlm.assignment.service.AssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl
        implements AssignmentService {

    private final AssignmentRepository assignmentRepository;

    @Override
    public AssignmentResponse createAssignment(
            AssignmentRequest request) {

        Assignment assignment =
                Assignment.builder()
                        .title(request.getTitle())
                        .description(request.getDescription())
                        .courseId(request.getCourseId())
                        .instructorId(request.getInstructorId())
                        .maxMarks(request.getMaxMarks())
                        .dueDate(request.getDueDate())
                        .createdAt(LocalDateTime.now())
                        .assignmentFileUrl(request.getAssignmentFileUrl())
                        .assignmentFileName(request.getAssignmentFileName())
                        .build();

        assignment =
                assignmentRepository.save(
                        assignment);

        return map(assignment);
    }

    @Override
    public List<AssignmentResponse> getInstructorAssignments(
            Long instructorId) {

        return assignmentRepository
                .findByInstructorId(
                        instructorId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public List<AssignmentResponse> getCourseAssignments(
            Long courseId) {

        return assignmentRepository
                .findByCourseId(
                        courseId)
                .stream()
                .map(this::map)
                .toList();
    }

    private AssignmentResponse map(
            Assignment assignment) {

        return AssignmentResponse
                .builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(
                        assignment.getDescription())
                .courseId(
                        assignment.getCourseId())
                .instructorId(
                        assignment.getInstructorId())
                .maxMarks(
                        assignment.getMaxMarks())
                .dueDate(
                        assignment.getDueDate())
                .createdAt(
                        assignment.getCreatedAt())

                .assignmentFileUrl(
                        assignment.getAssignmentFileUrl())

                .assignmentFileName(
                        assignment.getAssignmentFileName())
                .build();
    }
}