package com.dlm.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.identity.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}