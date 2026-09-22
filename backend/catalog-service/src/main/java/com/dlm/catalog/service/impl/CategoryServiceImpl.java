package com.dlm.catalog.service.impl;

import com.dlm.catalog.dto.CategoryRequest;
import com.dlm.catalog.dto.CategoryResponse;
import com.dlm.catalog.entity.Category;
import com.dlm.catalog.repository.CategoryRepository;
import com.dlm.catalog.service.CategoryService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl
        implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(
            CategoryRequest request) {

        if (categoryRepository.existsByName(
                request.getName())) {

            throw new RuntimeException(
                    "Category already exists");
        }

        Category category =
                Category.builder()
                        .name(request.getName())
                        .description(
                                request.getDescription())
                        .build();

        category = categoryRepository.save(category);

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(
                        category.getDescription())
                .build();
    }

    @Override
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(category ->
                        CategoryResponse.builder()
                                .id(category.getId())
                                .name(category.getName())
                                .description(
                                        category.getDescription())
                                .build()
                )
                .toList();
    }
}