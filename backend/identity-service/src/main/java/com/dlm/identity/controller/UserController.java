package com.dlm.identity.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.identity.dto.DashboardStatsResponse;
import com.dlm.identity.dto.UserProfileResponse;
import com.dlm.identity.dto.UserResponse;
import com.dlm.identity.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/api/users/me")
    public UserProfileResponse currentUser(
            Authentication authentication) {

        return userService.getCurrentUser(
                authentication.getName());
    }

    @GetMapping("/api/users/{id}")
    public UserResponse getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }

    @GetMapping("/api/users/dashboard-stats")
    public DashboardStatsResponse
    getDashboardStats() {

        return userService
                .getDashboardStats();
    }
}