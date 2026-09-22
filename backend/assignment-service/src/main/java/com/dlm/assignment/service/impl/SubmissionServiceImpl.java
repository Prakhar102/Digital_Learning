package com.dlm.assignment.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.assignment.dto.GradeRequest;
import com.dlm.assignment.dto.SubmissionRequest;
import com.dlm.assignment.dto.SubmissionResponse;
import com.dlm.assignment.entity.Submission;
import com.dlm.assignment.entity.SubmissionStatus;
import com.dlm.assignment.repository.SubmissionRepository;
import com.dlm.assignment.service.SubmissionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl
        implements SubmissionService {

    private final SubmissionRepository submissionRepository;

    @Override
    public SubmissionResponse submitAssignment(
            SubmissionRequest request) {

        Submission submission =
                Submission.builder()
                        .assignmentId(
                                request.getAssignmentId())
                        .learnerId(
                                request.getLearnerId())
                        .submissionText(
                                request.getSubmissionText())
                        .fileUrl(
                                request.getFileUrl())
                        .submittedAt(
                                LocalDateTime.now())
                        .status(
                                SubmissionStatus.SUBMITTED)
                        .build();

        submission =
                submissionRepository.save(
                        submission);

        return map(submission);
    }

    @Override
    public List<SubmissionResponse> getAssignmentSubmissions(
            Long assignmentId) {

        return submissionRepository
                .findByAssignmentId(
                        assignmentId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public List<SubmissionResponse> getLearnerSubmissions(
            Long learnerId) {

        return submissionRepository
                .findByLearnerId(
                        learnerId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public SubmissionResponse gradeSubmission(
            Long submissionId,
            GradeRequest request) {

        Submission submission =
                submissionRepository
                        .findById(submissionId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Submission not found"));

        submission.setMarks(
                request.getMarks());

        submission.setFeedback(
                request.getFeedback());

        submission.setStatus(
                SubmissionStatus.GRADED);

        submission.setGradedAt(
                LocalDateTime.now());

        submission =
                submissionRepository.save(
                        submission);

        return map(submission);
    }

    private SubmissionResponse map(
            Submission submission) {

        return SubmissionResponse
                .builder()
                .id(submission.getId())
                .assignmentId(
                        submission.getAssignmentId())
                .learnerId(
                        submission.getLearnerId())
                .submissionText(
                        submission.getSubmissionText())
                .fileUrl(
                        submission.getFileUrl())
                .submittedAt(
                        submission.getSubmittedAt())
                .status(
                        submission.getStatus())
                .marks(
                        submission.getMarks())
                .feedback(
                        submission.getFeedback())
                .gradedAt(
                        submission.getGradedAt())
                .build();
    }
}