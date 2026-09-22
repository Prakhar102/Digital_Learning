package com.dlm.catalog.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dlm.catalog.dto.CourseDetailsResponse;
import com.dlm.catalog.dto.CourseRequest;
import com.dlm.catalog.dto.CourseResponse;
import com.dlm.catalog.dto.LessonSummaryResponse;
import com.dlm.catalog.dto.ModuleDetailsResponse;
import com.dlm.catalog.entity.Category;
import com.dlm.catalog.entity.Course;
import com.dlm.catalog.entity.CourseStatus;
import com.dlm.catalog.exception.ResourceNotFoundException;
import com.dlm.catalog.repository.CategoryRepository;
import com.dlm.catalog.repository.CourseRepository;
import com.dlm.catalog.repository.LessonRepository;
import com.dlm.catalog.repository.ModuleRepository;
import com.dlm.catalog.service.CourseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl
        implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    private final ModuleRepository moduleRepository;

    private final LessonRepository lessonRepository;

    @Override
    public CourseResponse createCourse(
            CourseRequest request) {

        Category category =
                categoryRepository.findById(
                        request.getCategoryId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Category not found"));

        Course course =
                Course.builder()
                        .title(request.getTitle())
                        .description(
                                request.getDescription())
                        .level(request.getLevel())
                        .status(CourseStatus.DRAFT)
                        .ownerUserId(
                                request.getOwnerUserId())
                        .category(category)
                        .build();

        course = courseRepository.save(course);

        return mapToResponse(course);
    }

    @Override
    public List<CourseResponse> getAllCourses() {

        return courseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CourseResponse getCourseById(Long id) {

        Course course =
                courseRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Course not found"));

        return mapToResponse(course);
    }

    private CourseResponse mapToResponse(
            Course course) {

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .level(course.getLevel())
                .status(course.getStatus())
                .categoryId(
                        course.getCategory().getId())
                .ownerUserId(
                        course.getOwnerUserId())
                .build();
    }


    @Override
    public List<CourseResponse> searchCourses(String keyword) {

        return courseRepository
                .findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CourseResponse publishCourse(Long id) {

        Course course =
                courseRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Course not found"));

        course.setStatus(CourseStatus.PUBLISHED);

        course = courseRepository.save(course);

        return mapToResponse(course);
    }


    @Override
    public CourseDetailsResponse getCourseDetails(
            Long courseId) {

        Course course =
                courseRepository.findById(courseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Course not found"));

        List<ModuleDetailsResponse> modules =
                moduleRepository.findByCourseId(courseId)
                        .stream()
                        .map(module -> ModuleDetailsResponse.builder()
                                .id(module.getId())
                                .title(module.getTitle())
                                .sequenceNumber(module.getSequenceNumber())
                                .lessons(lessonRepository.findByModuleId(module.getId())
                                .stream()
                                .map(lesson -> LessonSummaryResponse.builder()
                                                                .id(lesson.getId())
                                                                .title(lesson.getTitle())
                                                                .durationInMinutes(lesson.getDurationInMinutes())
                                                                .build())
                                                .toList()
                                )
                                .build())
                        .toList();

        return CourseDetailsResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .level(course.getLevel())
                .status(course.getStatus())
                .categoryId(course.getCategory().getId())
                .ownerUserId(course.getOwnerUserId())
                .modules(modules)
                .build();
    }

    @Override
    public List<CourseResponse>
    getPublishedCourses() {

        return courseRepository
                .findByStatus(CourseStatus.PUBLISHED)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CourseResponse>
    getCoursesByCategory(Long categoryId) {

        return courseRepository
                .findByCategoryId(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}