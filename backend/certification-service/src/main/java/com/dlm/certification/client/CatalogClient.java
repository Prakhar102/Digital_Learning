package com.dlm.certification.client;

import com.dlm.certification.dto.CourseResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "CATALOG-SERVICE")
public interface CatalogClient {

    @GetMapping("/api/courses/{id}")
    CourseResponse getCourseById(@PathVariable Long id);
}