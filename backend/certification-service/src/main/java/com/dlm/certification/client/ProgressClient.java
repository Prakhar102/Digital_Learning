package com.dlm.certification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.dlm.certification.dto.ProgressResponse;

@FeignClient(name = "PROGRESS-SERVICE")
public interface ProgressClient {

    @GetMapping("/api/progress")
    ProgressResponse getProgress(
            @RequestParam Long userId,
            @RequestParam Long courseId);
}