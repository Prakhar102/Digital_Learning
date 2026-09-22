package com.dlm.identity.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LearnerController {

    @GetMapping("/api/learner/dashboard")
    @PreAuthorize("hasRole('LEARNER')")
    public String learnerDashboard() {

        return "Welcome Learner";

    }
}