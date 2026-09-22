package com.dlm.catalog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.catalog.dto.LessonRequest;
import com.dlm.catalog.dto.LessonResponse;
import com.dlm.catalog.entity.Lesson;
import com.dlm.catalog.entity.Module;
import com.dlm.catalog.repository.LessonRepository;
import com.dlm.catalog.repository.ModuleRepository;
import com.dlm.catalog.service.LessonService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;

    @Override
    public LessonResponse createLesson(
            LessonRequest request) {

        Module module =
                moduleRepository.findById(
                        request.getModuleId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Module not found"));

        Lesson lesson =
                Lesson.builder()
                        .title(request.getTitle())
                        .contentType(
                                request.getContentType())
                        .contentRef(
                                request.getContentRef())
                        .durationInMinutes(
                                request.getDurationInMinutes())
                        .sequenceNumber(
                                request.getSequenceNumber())
                        .module(module)
                        .build();

        lesson = lessonRepository.save(lesson);

        return mapToResponse(lesson);
    }

    @Override
    public List<LessonResponse> getLessonsByModule(
            Long moduleId) {

        return lessonRepository.findByModuleId(moduleId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LessonResponse mapToResponse(
            Lesson lesson) {

        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .contentType(lesson.getContentType())
                .contentRef(lesson.getContentRef())
                .durationInMinutes(
                        lesson.getDurationInMinutes())
                .sequenceNumber(
                        lesson.getSequenceNumber())
                .moduleId(
                        lesson.getModule().getId())
                .build();
    }
}