package com.dlm.catalog.service;

import java.util.List;

import com.dlm.catalog.dto.CourseDetailsResponse;
import com.dlm.catalog.dto.CourseRequest;
import com.dlm.catalog.dto.CourseResponse;


public interface CourseService {

    CourseResponse createCourse(CourseRequest request);

    List<CourseResponse> getAllCourses();

    CourseResponse getCourseById(Long id);

    List<CourseResponse> searchCourses(String keyword);

    CourseResponse publishCourse(Long id);

    CourseDetailsResponse getCourseDetails(Long courseId);

    List<CourseResponse> getPublishedCourses();

    List<CourseResponse> getCoursesByCategory(Long categoryId);
}