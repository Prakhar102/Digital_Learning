package com.dlm.assignment.service;

import java.util.List;

import com.dlm.assignment.dto.GradeRequest;
import com.dlm.assignment.dto.SubmissionRequest;
import com.dlm.assignment.dto.SubmissionResponse;

public interface SubmissionService {

    SubmissionResponse submitAssignment(
            SubmissionRequest request);

    List<SubmissionResponse> getAssignmentSubmissions(
            Long assignmentId);

    List<SubmissionResponse> getLearnerSubmissions(
            Long learnerId);

    SubmissionResponse gradeSubmission(
            Long submissionId,
            GradeRequest request);
}
