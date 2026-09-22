package com.dlm.catalog.service;

import java.util.List;

import com.dlm.catalog.dto.CategoryRequest;
import com.dlm.catalog.dto.CategoryResponse;

public interface CategoryService {

    CategoryResponse createCategory(
            CategoryRequest request);

    List<CategoryResponse> getAllCategories();
}