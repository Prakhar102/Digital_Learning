package com.dlm.progress.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.progress.entity.CourseEnrollment;
public interface CourseEnrollmentRepository
        extends JpaRepository<CourseEnrollment, Long> {

    List<CourseEnrollment>
    findByUserId(Long userId);

    boolean existsByUserIdAndCourseId(
            Long userId,
            Long courseId);

    long countByUserId(Long userId);
}
