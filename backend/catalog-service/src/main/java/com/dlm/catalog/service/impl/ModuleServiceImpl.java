package com.dlm.catalog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.catalog.dto.ModuleRequest;
import com.dlm.catalog.dto.ModuleResponse;
import com.dlm.catalog.entity.Course;
import com.dlm.catalog.entity.Module;
import com.dlm.catalog.repository.CourseRepository;
import com.dlm.catalog.repository.ModuleRepository;
import com.dlm.catalog.service.ModuleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    @Override
    public ModuleResponse createModule(
            ModuleRequest request) {

        Course course =
                courseRepository.findById(
                        request.getCourseId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Course not found"));

        Module module =
                Module.builder()
                        .title(request.getTitle())
                        .sequenceNumber(
                                request.getSequenceNumber())
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
                .build();
    }

    @Override
    public List<ModuleResponse> getModulesByCourse(
            Long courseId) {

        return moduleRepository
                .findByCourseId(courseId)
                .stream()
                .map(module ->
                        ModuleResponse.builder()
                                .id(module.getId())
                                .title(module.getTitle())
                                .sequenceNumber(
                                        module.getSequenceNumber())
                                .courseId(courseId)
                                .build())
                .toList();
    }
}