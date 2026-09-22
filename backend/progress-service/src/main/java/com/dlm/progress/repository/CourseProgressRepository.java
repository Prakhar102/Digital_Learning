package com.dlm.progress.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.progress.entity.CourseProgress;

public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {

    Optional<CourseProgress> findByUserIdAndCourseId(Long userId, Long courseId);

    long countByUserId(Long userId);

   long countByUserIdAndCompleted(Long userId, Boolean completed);
}