package com.dlm.identity.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InstructorController {

    @GetMapping("/api/instructor/dashboard")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public String instructorDashboard() {

        return "Welcome Instructor";

    }
}