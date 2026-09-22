package com.dlm.notification.service;

import java.util.List;

import com.dlm.notification.dto.NotificationRequest;
import com.dlm.notification.dto.NotificationResponse;

public interface NotificationService {

    NotificationResponse createNotification(
            NotificationRequest request);

    List<NotificationResponse> getNotificationsByUser(
            Long userId);
}