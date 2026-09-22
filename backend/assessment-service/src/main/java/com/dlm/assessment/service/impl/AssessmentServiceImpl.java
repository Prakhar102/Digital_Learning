package com.dlm.assessment.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.assessment.dto.AssessmentRequest;
import com.dlm.assessment.dto.AssessmentResponse;
import com.dlm.assessment.entity.Assessment;
import com.dlm.assessment.exception.ResourceNotFoundException;
import com.dlm.assessment.repository.AssessmentRepository;
import com.dlm.assessment.service.AssessmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl
        implements AssessmentService {

    private final AssessmentRepository assessmentRepository;

    @Override
    public AssessmentResponse createAssessment(
            AssessmentRequest request) {

        Assessment assessment =
                Assessment.builder()
                        .title(request.getTitle())
                        .courseId(request.getCourseId())
                        .passingMarks(
                                request.getPassingMarks())
                        .build();

        assessment =
                assessmentRepository.save(
                        assessment);

        return map(assessment);
    }

    @Override
    public List<AssessmentResponse>
    getAssessmentsByCourse(
            Long courseId) {

        return assessmentRepository
                .findByCourseId(courseId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public AssessmentResponse
    getAssessmentById(Long id) {

        Assessment assessment =
                assessmentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment not found"));

        return map(assessment);
    }

    private AssessmentResponse map(
            Assessment assessment) {

        return AssessmentResponse.builder()
                .id(assessment.getId())
                .title(assessment.getTitle())
                .courseId(assessment.getCourseId())
                .passingMarks(assessment.getPassingMarks())
                .build();
    }
}