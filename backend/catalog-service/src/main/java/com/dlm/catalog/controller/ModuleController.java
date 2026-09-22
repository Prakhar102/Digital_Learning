package com.dlm.catalog.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.catalog.dto.ModuleRequest;
import com.dlm.catalog.dto.ModuleResponse;
import com.dlm.catalog.service.ModuleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @PostMapping
    public ModuleResponse createModule(
            @Valid
            @RequestBody ModuleRequest request) {

        return moduleService.createModule(request);
    }

    @GetMapping("/course/{courseId}")
    public List<ModuleResponse> getModulesByCourse(
            @PathVariable Long courseId) {

        return moduleService.getModulesByCourse(
                courseId);
    }
}