package com.dlm.progress.service;
import java.util.List;

import com.dlm.progress.dto.EnrollmentRequest;
import com.dlm.progress.entity.CourseEnrollment;
public interface EnrollmentService {

    void enroll(EnrollmentRequest request);
    List<CourseEnrollment> getMyCourses(
        Long userId);
}
