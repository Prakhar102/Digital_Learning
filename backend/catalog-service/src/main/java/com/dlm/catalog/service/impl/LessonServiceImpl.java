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

        String cType = (request.getContentType() != null && !request.getContentType().isBlank())
                ? request.getContentType()
                : "VIDEO";

        String vUrl = (request.getVideoUrl() != null && !request.getVideoUrl().isBlank())
                ? request.getVideoUrl()
                : request.getContentRef();

        String cRef = (request.getContentRef() != null && !request.getContentRef().isBlank())
                ? request.getContentRef()
                : vUrl;

        Integer seq = request.getSequenceNumber() != null
                ? request.getSequenceNumber()
                : (request.getOrderIndex() != null ? request.getOrderIndex() : 1);

        Integer duration = request.getDurationInMinutes() != null
                ? request.getDurationInMinutes()
                : 15;

        Lesson lesson =
                Lesson.builder()
                        .title(request.getTitle())
                        .contentType(cType)
                        .contentRef(cRef)
                        .videoUrl(vUrl)
                        .content(request.getContent())
                        .durationInMinutes(duration)
                        .sequenceNumber(seq)
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
                .videoUrl(lesson.getVideoUrl())
                .content(lesson.getContent())
                .durationInMinutes(
                        lesson.getDurationInMinutes())
                .sequenceNumber(
                        lesson.getSequenceNumber())
                .moduleId(
                        lesson.getModule().getId())
                .build();
    }
}