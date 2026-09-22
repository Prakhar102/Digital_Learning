package com.dlm.progress.controller;

import com.dlm.progress.dto.ProgressDashboardResponse;
import com.dlm.progress.dto.ProgressRequest;
import com.dlm.progress.dto.ProgressResponse;
import com.dlm.progress.service.ProgressService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping
    public ProgressResponse updateProgress(
            @Valid
            @RequestBody ProgressRequest request) {

        return progressService.updateProgress(request);
    }

    @GetMapping
    public ProgressResponse getProgress(
            @RequestParam Long userId,
            @RequestParam Long courseId) {

        return progressService.getProgress(
                userId,
                courseId);
    }

    @GetMapping("/dashboard")
    public ProgressDashboardResponse
    getDashboard(@RequestParam Long userId) {

        return progressService.getDashboard(userId);
    }
}
