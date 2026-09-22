package com.dlm.certification.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.dlm.certification.client.AssessmentClient;
import com.dlm.certification.client.CatalogClient;
import com.dlm.certification.client.IdentityClient;
import com.dlm.certification.client.NotificationClient;
import com.dlm.certification.client.ProgressClient;
import com.dlm.certification.dto.AttemptResponse;
import com.dlm.certification.dto.CertificateRequest;
import com.dlm.certification.dto.CertificateResponse;
import com.dlm.certification.dto.CourseResponse;
import com.dlm.certification.dto.NotificationRequest;
import com.dlm.certification.dto.ProgressResponse;
import com.dlm.certification.dto.UserResponse;
import com.dlm.certification.entity.Certificate;
import com.dlm.certification.exception.DuplicateResourceException;
import com.dlm.certification.exception.ResourceNotFoundException;
import com.dlm.certification.repository.CertificateRepository;
import com.dlm.certification.service.CertificateService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;

    private final ProgressClient progressClient;

    private final AssessmentClient assessmentClient;

    private final NotificationClient notificationClient;

    private final IdentityClient identityClient;

    private final CatalogClient catalogClient;

    @Override
    public CertificateResponse generateCertificate(CertificateRequest request) {

        if (!isEligible(request.getUserId(), request.getCourseId())) {

            throw new RuntimeException("User is not eligible for certificate");
        }

        boolean alreadyExists = certificateRepository.existsByUserIdAndCourseId(request.getUserId(), request.getCourseId());

        if (alreadyExists) {
            throw new DuplicateResourceException("Certificate already generated");
        }


        Certificate certificate =
                Certificate.builder()
                        .userId(request.getUserId())
                        .courseId(request.getCourseId())
                        .certificateNumber(UUID.randomUUID().toString())
                        .issuedDate(LocalDateTime.now())
                        .build();

        certificate = certificateRepository.save(certificate);

        NotificationRequest notification = new NotificationRequest();

        notification.setUserId(request.getUserId());

        notification.setSubject("Certificate Generated");

        notification.setMessage("Congratulations! Your certificate for course " + request.getCourseId() + " has been generated successfully.");

        notificationClient.createNotification(notification);

        return map(certificate);
    }

    @Override
    public List<CertificateResponse> getCertificatesByUser(Long userId) {

        return certificateRepository
                .findByUserId(userId)
                .stream()
                .map(this::map)
                .toList();
    }

    private CertificateResponse map(Certificate certificate) {

        return CertificateResponse.builder()
                .id(certificate.getId())
                .userId(certificate.getUserId())
                .courseId(certificate.getCourseId())
                .certificateNumber(certificate.getCertificateNumber())
                .issuedDate(certificate.getIssuedDate())
                .build();
    }


   @Override
    public Boolean isProgressCompleted(Long userId, Long courseId) {

        try {

            ProgressResponse progress = progressClient.getProgress(userId, courseId);

            return Boolean.TRUE.equals(progress.getCompleted());

        } catch (Exception ex) {

            return false;
        }
    }


    @Override
    public Boolean hasPassedAssessment(Long userId) {

        try {

            return assessmentClient
                    .getAttemptsByUser(userId)
                    .stream()
                    .anyMatch(AttemptResponse::getPassed);

        } catch (Exception ex) {

            return false;
        }
    }


    @Override
    public Boolean isEligible(Long userId, Long courseId) {

        boolean progressCompleted = isProgressCompleted(userId, courseId);

        boolean assessmentPassed = hasPassedAssessment(userId);

        return progressCompleted && assessmentPassed;
    }


    @Override
    public CertificateResponse getCertificateById(
            Long certificateId) {

        Certificate certificate =
                certificateRepository
                        .findById(certificateId)
                        .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));

        return map(certificate);
    }

    @Override
    public String getLearnerName(Long userId) {

        UserResponse user = identityClient.getUserById(userId);

        return user.getFullName();
    }

    @Override
    public String getCourseTitle(Long courseId) {

        CourseResponse course = catalogClient.getCourseById(courseId);

        return course.getTitle();
    }
}