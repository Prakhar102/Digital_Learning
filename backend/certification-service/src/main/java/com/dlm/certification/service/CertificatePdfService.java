package com.dlm.certification.service;

public interface CertificatePdfService {

    byte[] generateCertificatePdf(
            String learnerName,
            String courseName,
            String certificateNumber);
}