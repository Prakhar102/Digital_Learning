package com.dlm.certification.dto;

import lombok.Data;

@Data
public class NotificationRequest {

    private Long userId;

    private String subject;

    private String message;
}
