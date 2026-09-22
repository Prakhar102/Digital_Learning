package com.dlm.progress.service.impl;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.progress.dto.EnrollmentRequest;
import com.dlm.progress.entity.CourseEnrollment;
import com.dlm.progress.repository.CourseEnrollmentRepository;
import com.dlm.progress.service.EnrollmentService;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl
        implements EnrollmentService {

    private final CourseEnrollmentRepository repository;

    @Override
    public void enroll(
            EnrollmentRequest request) {

        CourseEnrollment enrollment =
                CourseEnrollment.builder()
                        .userId(request.getUserId())
                        .courseId(request.getCourseId())
                        .enrolledAt(LocalDateTime.now())
                        .build();

        repository.save(enrollment);
    }


    @Override
    public List<CourseEnrollment>
    getMyCourses(Long userId) {

        return repository.findByUserId(
                userId);
    }
}
