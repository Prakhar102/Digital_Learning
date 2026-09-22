package com.dlm.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.catalog.entity.Category;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    boolean existsByName(String name);

}