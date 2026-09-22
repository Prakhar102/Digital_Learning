package com.dlm.identity.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import com.dlm.identity.dto.AdminStatsResponse;
import com.dlm.identity.dto.CreateInstructorRequest;
import com.dlm.identity.dto.InstructorResponse;
import com.dlm.identity.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/api/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminDashboard() {

        return "Welcome Admin";
    }

    @PostMapping("/api/admin/instructors")
    @PreAuthorize("hasRole('ADMIN')")
    public String createInstructor(
            @RequestBody
            CreateInstructorRequest request) {

        return userService
                .createInstructor(request);
    }

    @GetMapping("/api/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminStatsResponse getStats() {

        return userService.getAdminStats();
    }



    @GetMapping("/api/admin/instructors")
    @PreAuthorize("hasRole('ADMIN')")
    public List<InstructorResponse> getAllInstructors() {

        return userService.getAllInstructors();
    }
}