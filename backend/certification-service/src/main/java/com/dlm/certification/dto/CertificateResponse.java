package com.dlm.certification.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CertificateResponse {

    private Long id;

    private Long userId;

    private Long courseId;

    private String certificateNumber;

    private LocalDateTime issuedDate;
}