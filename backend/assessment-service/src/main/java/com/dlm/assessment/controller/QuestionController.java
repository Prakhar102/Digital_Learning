package com.dlm.assessment.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.assessment.dto.QuestionRequest;
import com.dlm.assessment.dto.QuestionResponse;
import com.dlm.assessment.service.QuestionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    public QuestionResponse createQuestion(
            @Valid
            @RequestBody QuestionRequest request) {

        return questionService.createQuestion(request);
    }

    @GetMapping("/assessment/{assessmentId}")
    public List<QuestionResponse>
    getQuestionsByAssessment(@PathVariable Long assessmentId) {

        return questionService.getQuestionsByAssessment(assessmentId);
    }
}