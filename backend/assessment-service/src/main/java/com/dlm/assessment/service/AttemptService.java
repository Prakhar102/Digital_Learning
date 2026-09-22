package com.dlm.assessment.service;

import java.util.List;

import com.dlm.assessment.dto.AssessmentDashboardResponse;
import com.dlm.assessment.dto.AttemptRequest;
import com.dlm.assessment.dto.AttemptResponse;
import com.dlm.assessment.dto.LeaderboardResponse;

public interface AttemptService {

    AttemptResponse submitAttempt(AttemptRequest request);

    List<AttemptResponse> getAttemptsByUser(Long userId);

    AssessmentDashboardResponse getAssessmentDashboard(Long assessmentId);

    List<LeaderboardResponse> getLeaderboard(Long assessmentId);
}