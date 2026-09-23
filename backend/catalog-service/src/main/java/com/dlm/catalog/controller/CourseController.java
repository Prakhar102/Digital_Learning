package com.dlm.catalog.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.catalog.dto.CourseDetailsResponse;
import com.dlm.catalog.dto.CourseRequest;
import com.dlm.catalog.dto.CourseResponse;
import com.dlm.catalog.service.CourseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    public CourseResponse createCourse(
            @Valid
            @RequestBody CourseRequest request) {

        return courseService.createCourse(
                request);
    }

    @GetMapping
    public List<CourseResponse> getAllCourses() {

        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public CourseResponse getCourseById(
            @PathVariable Long id) {

        return courseService.getCourseById(id);
    }

    @GetMapping("/search")
    public List<CourseResponse> searchCourses(@RequestParam String keyword) {

        return courseService.searchCourses(keyword);
    }

    @PutMapping("/{id}/publish")
    public CourseResponse publishCourse(@PathVariable Long id) {

        return courseService.publishCourse(id);
    }

    @GetMapping("/{id}/details")
    public CourseDetailsResponse getCourseDetails(@PathVariable Long id) {

        return courseService.getCourseDetails(id);
    }

    @GetMapping("/published")
    public List<CourseResponse>
    getPublishedCourses() {

        return courseService.getPublishedCourses();
    }

    @GetMapping("/category/{categoryId}")
    public List<CourseResponse>
    getCoursesByCategory(@PathVariable Long categoryId) {

        return courseService.getCoursesByCategory(categoryId);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }

}