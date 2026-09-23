package com.dlm.catalog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.catalog.dto.LessonResponse;
import com.dlm.catalog.dto.ModuleRequest;
import com.dlm.catalog.dto.ModuleResponse;
import com.dlm.catalog.entity.Course;
import com.dlm.catalog.entity.Module;
import com.dlm.catalog.repository.CourseRepository;
import com.dlm.catalog.repository.LessonRepository;
import com.dlm.catalog.repository.ModuleRepository;
import com.dlm.catalog.service.ModuleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    @Override
    public ModuleResponse createModule(
            ModuleRequest request) {

        Course course =
                courseRepository.findById(
                        request.getCourseId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Course not found"));

        Integer seq = request.getSequenceNumber() != null 
                ? request.getSequenceNumber() 
                : (request.getOrderIndex() != null ? request.getOrderIndex() : 1);

        Module module =
                Module.builder()
                        .title(request.getTitle())
                        .sequenceNumber(seq)
                        .course(course)
                        .build();

        module = moduleRepository.save(module);

        return ModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .sequenceNumber(
                        module.getSequenceNumber())
                .courseId(
                        module.getCourse().getId())
                .lessons(List.of())
                .build();
    }

    @Override
    public List<ModuleResponse> getModulesByCourse(
            Long courseId) {

        return moduleRepository
                .findByCourseId(courseId)
                .stream()
                .map(module -> {
                    List<LessonResponse> lessons = lessonRepository.findByModuleId(module.getId())
                            .stream()
                            .map(l -> LessonResponse.builder()
                                    .id(l.getId())
                                    .title(l.getTitle())
                                    .contentType(l.getContentType())
                                    .contentRef(l.getContentRef())
                                    .videoUrl(l.getVideoUrl())
                                    .content(l.getContent())
                                    .durationInMinutes(l.getDurationInMinutes())
                                    .sequenceNumber(l.getSequenceNumber())
                                    .moduleId(module.getId())
                                    .build())
                            .toList();

                    return ModuleResponse.builder()
                            .id(module.getId())
                            .title(module.getTitle())
                            .sequenceNumber(
                                    module.getSequenceNumber())
                            .courseId(courseId)
                            .lessons(lessons)
                            .build();
                })
                .toList();
    }
}