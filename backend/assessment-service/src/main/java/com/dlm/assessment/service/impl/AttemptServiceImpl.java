package com.dlm.assessment.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dlm.assessment.dto.AssessmentDashboardResponse;
import com.dlm.assessment.dto.AttemptRequest;
import com.dlm.assessment.dto.AttemptResponse;
import com.dlm.assessment.dto.LeaderboardResponse;
import com.dlm.assessment.entity.Assessment;
import com.dlm.assessment.entity.Question;
import com.dlm.assessment.entity.StudentAttempt;
import com.dlm.assessment.exception.ResourceNotFoundException;
import com.dlm.assessment.repository.AssessmentRepository;
import com.dlm.assessment.repository.QuestionRepository;
import com.dlm.assessment.repository.StudentAttemptRepository;
import com.dlm.assessment.service.AttemptService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttemptServiceImpl implements AttemptService {

    private final StudentAttemptRepository studentAttemptRepository;
    private final QuestionRepository questionRepository;
    private final AssessmentRepository assessmentRepository;

    @Override
    public AttemptResponse submitAttempt(
            AttemptRequest request) {

        Assessment assessment =
                assessmentRepository
                        .findById(request.getAssessmentId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment not found"));

        List<Question> questions =
                questionRepository.findByAssessmentId(
                        request.getAssessmentId());

        int score = 0;

        Map<Long, String> answers =
                request.getAnswers();

        for (Question question : questions) {

            String submittedAnswer =
                    answers.get(question.getId());

            if (submittedAnswer != null
                    && submittedAnswer.equalsIgnoreCase(
                    question.getCorrectAnswer())) {

                score++;
            }
        }

        boolean passed =
                score >= assessment.getPassingMarks();

        StudentAttempt attempt =
                StudentAttempt.builder()
                        .userId(request.getUserId())
                        .assessmentId(
                                request.getAssessmentId())
                        .score(score)
                        .passed(passed)
                        .build();

        studentAttemptRepository.save(attempt);

        return AttemptResponse.builder()
                .userId(request.getUserId())
                .assessmentId(
                        request.getAssessmentId())
                .score(score)
                .passed(passed)
                .build();
    }

    @Override
    public List<AttemptResponse> getAttemptsByUser(
            Long userId) {

        return studentAttemptRepository
                .findByUserId(userId)
                .stream()
                .map(attempt ->
                        AttemptResponse.builder()
                                .userId(attempt.getUserId())
                                .assessmentId(attempt.getAssessmentId())
                                .score(attempt.getScore())
                                .passed(attempt.getPassed())
                                .build())
                .toList();
    }


    @Override
    public AssessmentDashboardResponse getAssessmentDashboard(Long assessmentId) {

        List<StudentAttempt> attempts = studentAttemptRepository.findByAssessmentId(assessmentId);

        long totalAttempts = attempts.size();

        int highestScore = attempts.stream()
                        .mapToInt(StudentAttempt::getScore)
                        .max()
                        .orElse(0);

        double averageScore =
                attempts.stream()
                        .mapToInt(StudentAttempt::getScore)
                        .average()
                        .orElse(0.0);

        long passedAttempts =
                studentAttemptRepository.countByAssessmentIdAndPassed(assessmentId, true);

        double passPercentage =
                totalAttempts == 0
                        ? 0
                        : ((double) passedAttempts
                            / totalAttempts) * 100;

        return AssessmentDashboardResponse
                .builder()
                .totalAttempts(totalAttempts)
                .averageScore(averageScore)
                .highestScore(highestScore)
                .passPercentage(passPercentage)
                .build();
    }


    @Override
    public List<LeaderboardResponse> getLeaderboard(Long assessmentId) {

        return studentAttemptRepository
                .findByAssessmentId(assessmentId)
                .stream()
                .sorted((a, b) -> Integer.compare(b.getScore(),a.getScore()))
                .map(attempt ->
                        LeaderboardResponse.builder()
                                .userId(attempt.getUserId())
                                .score(attempt.getScore())
                                .build()
                )
                .toList();
    }
}