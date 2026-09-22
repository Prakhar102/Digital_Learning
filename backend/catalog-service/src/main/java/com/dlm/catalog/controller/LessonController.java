package com.dlm.catalog.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.catalog.dto.LessonRequest;
import com.dlm.catalog.dto.LessonResponse;
import com.dlm.catalog.service.LessonService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @PostMapping
    public LessonResponse createLesson(
            @Valid
            @RequestBody LessonRequest request) {

        return lessonService.createLesson(request);
    }

    @GetMapping("/module/{moduleId}")
    public List<LessonResponse> getLessonsByModule(
            @PathVariable Long moduleId) {

        return lessonService.getLessonsByModule(moduleId);
    }
}