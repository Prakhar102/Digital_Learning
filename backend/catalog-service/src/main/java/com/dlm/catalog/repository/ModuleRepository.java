package com.dlm.catalog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.catalog.entity.Module;

public interface ModuleRepository
        extends JpaRepository<Module, Long> {

    List<Module> findByCourseId(Long courseId);

}