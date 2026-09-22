package com.dlm.notification.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.notification.dto.NotificationRequest;
import com.dlm.notification.dto.NotificationResponse;
import com.dlm.notification.entity.Notification;
import com.dlm.notification.repository.NotificationRepository;
import com.dlm.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationResponse createNotification(
            NotificationRequest request) {

        Notification notification =
                Notification.builder()
                        .userId(request.getUserId())
                        .subject(request.getSubject())
                        .message(request.getMessage())
                        .status("CREATED")
                        .createdAt(LocalDateTime.now())
                        .build();

        notification =
                notificationRepository.save(notification);

        return map(notification);
    }

    @Override
    public List<NotificationResponse>
    getNotificationsByUser(Long userId) {

        return notificationRepository
                .findByUserId(userId)
                .stream()
                .map(this::map)
                .toList();
    }

    private NotificationResponse map(
            Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .subject(notification.getSubject())
                .message(notification.getMessage())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}