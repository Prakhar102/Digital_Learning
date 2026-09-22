package com.dlm.assessment.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.assessment.dto.AssessmentRequest;
import com.dlm.assessment.dto.AssessmentResponse;
import com.dlm.assessment.service.AssessmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    public AssessmentResponse createAssessment(
            @Valid
            @RequestBody AssessmentRequest request) {

        return assessmentService.createAssessment(request);
    }

    @GetMapping("/course/{courseId}")
    public List<AssessmentResponse>
    getAssessmentsByCourse(@PathVariable Long courseId) {

        return assessmentService.getAssessmentsByCourse(courseId);
    }

    @GetMapping("/{id}")
    public AssessmentResponse getAssessmentById(@PathVariable Long id) {

        return assessmentService.getAssessmentById(id);
    }
}