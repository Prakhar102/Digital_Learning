package com.dlm.catalog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.catalog.entity.Lesson;

public interface LessonRepository
        extends JpaRepository<Lesson, Long> {

    List<Lesson> findByModuleId(Long moduleId);

}