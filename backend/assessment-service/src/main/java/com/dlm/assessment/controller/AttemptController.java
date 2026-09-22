package com.dlm.assessment.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.assessment.dto.AssessmentDashboardResponse;
import com.dlm.assessment.dto.AttemptRequest;
import com.dlm.assessment.dto.AttemptResponse;
import com.dlm.assessment.dto.LeaderboardResponse;
import com.dlm.assessment.service.AttemptService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping
    public AttemptResponse submitAttempt(@RequestBody AttemptRequest request) {

        return attemptService.submitAttempt(request);
    }

    @GetMapping("/user/{userId}")
    public List<AttemptResponse> getAttemptsByUser(@PathVariable Long userId) {

        return attemptService.getAttemptsByUser(userId);
    }

    @GetMapping("/dashboard/{assessmentId}")
    public AssessmentDashboardResponse
    getDashboard(@PathVariable Long assessmentId) {

        return attemptService.getAssessmentDashboard(assessmentId);
    }

    @GetMapping("/leaderboard/{assessmentId}")
    public List<LeaderboardResponse> getLeaderboard(@PathVariable Long assessmentId) {

        return attemptService.getLeaderboard(assessmentId);
    }

}