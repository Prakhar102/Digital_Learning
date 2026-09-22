package com.dlm.assignment.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.dlm.assignment.dto.GradeRequest;
import com.dlm.assignment.dto.SubmissionRequest;
import com.dlm.assignment.dto.SubmissionResponse;
import com.dlm.assignment.service.SubmissionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public SubmissionResponse submitAssignment(
            @RequestBody SubmissionRequest request) {

        return submissionService
                .submitAssignment(request);
    }

    @GetMapping("/assignment/{id}")
    public List<SubmissionResponse> getAssignmentSubmissions(
            @PathVariable Long id) {

        return submissionService
                .getAssignmentSubmissions(id);
    }

    @GetMapping("/learner/{id}")
    public List<SubmissionResponse> getLearnerSubmissions(
            @PathVariable Long id) {

        return submissionService
                .getLearnerSubmissions(id);
    }

    @PutMapping("/{id}/grade")
    public SubmissionResponse gradeSubmission(
            @PathVariable Long id,
            @RequestBody GradeRequest request) {

        return submissionService
                .gradeSubmission(
                        id,
                        request);
    }
}