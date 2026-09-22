package com.dlm.catalog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.catalog.entity.Course;
import com.dlm.catalog.entity.CourseStatus;

public interface CourseRepository
        extends JpaRepository<Course, Long> {

    List<Course> findByCategoryId(Long categoryId);

    List<Course> findByTitleContainingIgnoreCase(String keyword);

    List<Course> findByStatus(CourseStatus status);

}