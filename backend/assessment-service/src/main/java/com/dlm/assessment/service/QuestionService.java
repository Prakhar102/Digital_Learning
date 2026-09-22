package com.dlm.assessment.service;

import java.util.List;

import com.dlm.assessment.dto.QuestionRequest;
import com.dlm.assessment.dto.QuestionResponse;

public interface QuestionService {

    QuestionResponse createQuestion(QuestionRequest request);

    List<QuestionResponse> getQuestionsByAssessment(Long assessmentId);
}