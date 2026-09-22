package com.dlm.certification.dto;

import lombok.Data;

@Data
public class CertificatePdfRequest {

    private String learnerName;

    private String courseName;

    private String certificateNumber;
}