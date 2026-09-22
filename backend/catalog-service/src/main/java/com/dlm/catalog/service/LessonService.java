package com.dlm.catalog.service;

import java.util.List;

import com.dlm.catalog.dto.LessonRequest;
import com.dlm.catalog.dto.LessonResponse;

public interface LessonService {

    LessonResponse createLesson(LessonRequest request);

    List<LessonResponse> getLessonsByModule(Long moduleId);
}