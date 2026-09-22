package com.dlm.progress.controller;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.progress.dto.EnrollmentRequest;
import com.dlm.progress.entity.CourseEnrollment;
import com.dlm.progress.service.EnrollmentService;

import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public String enroll(
            @RequestBody
            EnrollmentRequest request) {

        enrollmentService.enroll(request);

        return "Enrolled Successfully";
    }

    @GetMapping("/user/{userId}")
    public List<CourseEnrollment> getMyCourses(@PathVariable Long userId) {

        return enrollmentService
                .getMyCourses(userId);
    }
}
