package com.dlm.progress.service;

import com.dlm.progress.dto.ProgressDashboardResponse;
import com.dlm.progress.dto.ProgressRequest;
import com.dlm.progress.dto.ProgressResponse;

public interface ProgressService {

    ProgressResponse updateProgress(ProgressRequest request);

    ProgressResponse getProgress(Long userId, Long courseId);

    ProgressDashboardResponse getDashboard(Long userId);
}