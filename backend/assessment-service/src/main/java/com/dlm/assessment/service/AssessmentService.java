package com.dlm.assessment.service;

import java.util.List;

import com.dlm.assessment.dto.AssessmentRequest;
import com.dlm.assessment.dto.AssessmentResponse;

public interface AssessmentService {

    AssessmentResponse createAssessment(AssessmentRequest request);

    List<AssessmentResponse> getAssessmentsByCourse(Long courseId);

    AssessmentResponse getAssessmentById(Long id);
}