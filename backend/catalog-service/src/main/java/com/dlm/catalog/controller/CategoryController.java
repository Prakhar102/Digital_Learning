package com.dlm.catalog.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.catalog.dto.CategoryRequest;
import com.dlm.catalog.dto.CategoryResponse;
import com.dlm.catalog.service.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public CategoryResponse createCategory(
            @Valid
            @RequestBody CategoryRequest request) {

        return categoryService
                .createCategory(request);
    }

    @GetMapping
    public List<CategoryResponse>
    getAllCategories() {

        return categoryService
                .getAllCategories();
    }
}