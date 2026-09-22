package com.dlm.assignment.service;

import java.util.List;

import com.dlm.assignment.dto.AssignmentRequest;
import com.dlm.assignment.dto.AssignmentResponse;

public interface AssignmentService {

    AssignmentResponse createAssignment(AssignmentRequest request);

    List<AssignmentResponse> getInstructorAssignments(Long instructorId);

    List<AssignmentResponse> getCourseAssignments(Long courseId);
}