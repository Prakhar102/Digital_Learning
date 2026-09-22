package com.dlm.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String subject;

    @NotBlank
    private String message;
}