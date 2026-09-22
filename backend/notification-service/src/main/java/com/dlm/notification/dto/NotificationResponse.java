package com.dlm.notification.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {

    private Long id;

    private Long userId;

    private String subject;

    private String message;

    private String status;

    private LocalDateTime createdAt;
}