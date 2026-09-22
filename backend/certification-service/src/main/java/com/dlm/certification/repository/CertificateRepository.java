package com.dlm.certification.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.certification.entity.Certificate;

public interface CertificateRepository
        extends JpaRepository<Certificate, Long> {

    List<Certificate> findByUserId(Long userId);

    boolean existsByUserIdAndCourseId(
            Long userId,
            Long courseId);

    Optional<Certificate> findById(Long id);
}