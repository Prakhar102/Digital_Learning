package com.dlm.assessment.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.assessment.dto.QuestionRequest;
import com.dlm.assessment.dto.QuestionResponse;
import com.dlm.assessment.entity.Assessment;
import com.dlm.assessment.entity.Question;
import com.dlm.assessment.exception.ResourceNotFoundException;
import com.dlm.assessment.repository.AssessmentRepository;
import com.dlm.assessment.repository.QuestionRepository;
import com.dlm.assessment.service.QuestionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl
        implements QuestionService {

    private final QuestionRepository questionRepository;
    private final AssessmentRepository assessmentRepository;

    @Override
    public QuestionResponse createQuestion(
            QuestionRequest request) {

        Assessment assessment =
                assessmentRepository
                        .findById(request.getAssessmentId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment not found"));

        Question question =
                Question.builder()
                        .questionText(request.getQuestionText())
                        .optionA(request.getOptionA())
                        .optionB(request.getOptionB())
                        .optionC(request.getOptionC())
                        .optionD(request.getOptionD())
                        .correctAnswer(
                                request.getCorrectAnswer())
                        .assessment(assessment)
                        .build();

        question = questionRepository.save(question);

        return map(question);
    }

    @Override
    public List<QuestionResponse> getQuestionsByAssessment(Long assessmentId) {

        return questionRepository
                .findByAssessmentId(assessmentId)
                .stream()
                .map(this::map)
                .toList();
    }

    private QuestionResponse map(Question question) {

        return QuestionResponse.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .assessmentId(question.getAssessment().getId())
                .build();
    }
}