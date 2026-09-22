package com.dlm.certification.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.certification.dto.CertificateRequest;
import com.dlm.certification.dto.CertificateResponse;
import com.dlm.certification.dto.EligibilityResponse;
import com.dlm.certification.service.CertificatePdfService;
import com.dlm.certification.service.CertificateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    private final CertificatePdfService certificatePdfService;

    @PostMapping
    public CertificateResponse generateCertificate(@RequestBody CertificateRequest request) {

        return certificateService.generateCertificate(request);
    }

    @GetMapping("/user/{userId}")
    public List<CertificateResponse> getCertificatesByUser(@PathVariable Long userId) {

        return certificateService.getCertificatesByUser(userId);
    }

    @GetMapping("/eligibility")
    public EligibilityResponse checkEligibility(
            @RequestParam Long userId,
            @RequestParam Long courseId) {

        boolean eligible =
                certificateService
                        .isEligible(
                                userId,
                                courseId);

        return EligibilityResponse.builder()
                .userId(userId)
                .courseId(courseId)
                .eligible(eligible)
                .build();
    }

    @GetMapping("/progress-check")
    public Boolean progressCheck(@RequestParam Long userId, @RequestParam Long courseId) {

        return certificateService.isProgressCompleted(userId, courseId);
    }


    @GetMapping("/assessment-check/{userId}")
    public Boolean assessmentCheck(@PathVariable Long userId) {

        return certificateService.hasPassedAssessment(userId);
    }



   @GetMapping(value = "/pdf/{certificateId}", produces = "application/pdf")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long certificateId) {

        CertificateResponse certificate =
                certificateService.getCertificateById(
                        certificateId);

        String learnerName = certificateService.getLearnerName(certificate.getUserId());

        String courseTitle = certificateService.getCourseTitle(certificate.getCourseId());

        byte[] pdf =
                certificatePdfService
                        .generateCertificatePdf(
                                learnerName,
                                courseTitle,
                                certificate.getCertificateNumber());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate.pdf")
                .body(pdf);
    }

    @GetMapping("/{id}")
    public CertificateResponse getCertificate(@PathVariable Long id) {

        return certificateService.getCertificateById(id);
    }

    @GetMapping("/user-name/{userId}")  // Temproray endpoint
    public String getUserName(@PathVariable Long userId) {

        return certificateService.getLearnerName(userId);
    }

    @GetMapping("/course-title/{courseId}")   // Temproray endpoint
    public String getCourseTitle(@PathVariable Long courseId) {

        return certificateService.getCourseTitle(courseId);
    }

}