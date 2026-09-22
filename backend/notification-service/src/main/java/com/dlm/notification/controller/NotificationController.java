package com.dlm.notification.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.notification.dto.NotificationRequest;
import com.dlm.notification.dto.NotificationResponse;
import com.dlm.notification.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public NotificationResponse createNotification(
            @Valid
            @RequestBody NotificationRequest request) {

        return notificationService
                .createNotification(request);
    }

    @GetMapping("/user/{userId}")
    public List<NotificationResponse> getNotificationsByUser(
            @PathVariable Long userId) {

        return notificationService
                .getNotificationsByUser(userId);
    }
}