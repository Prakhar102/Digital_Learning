package com.dlm.certification.service;

import java.util.List;

import com.dlm.certification.dto.CertificateRequest;
import com.dlm.certification.dto.CertificateResponse;

public interface CertificateService {

    CertificateResponse generateCertificate(CertificateRequest request);

    List<CertificateResponse> getCertificatesByUser(Long userId);

    Boolean isProgressCompleted(Long userId, Long courseId);

    Boolean hasPassedAssessment(Long userId);

    Boolean isEligible(Long userId, Long courseId);

    CertificateResponse getCertificateById(Long certificateId);

    String getLearnerName(Long userId);

    String getCourseTitle(Long courseId);
}