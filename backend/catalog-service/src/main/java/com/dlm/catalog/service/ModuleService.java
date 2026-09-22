package com.dlm.catalog.service;

import java.util.List;

import com.dlm.catalog.dto.ModuleRequest;
import com.dlm.catalog.dto.ModuleResponse;

public interface ModuleService {

    ModuleResponse createModule(ModuleRequest request);

    List<ModuleResponse> getModulesByCourse(Long courseId);
}