package com.dlm.certification.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.dlm.certification.dto.AttemptResponse;

@FeignClient(name = "ASSESSMENT-SERVICE")
public interface AssessmentClient {

    @GetMapping("/api/attempts/user/{userId}")
    List<AttemptResponse> getAttemptsByUser(@PathVariable Long userId);
}