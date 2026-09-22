package com.dlm.identity.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.dlm.identity.entity.AuditLog;
import com.dlm.identity.repository.AuditLogRepository;
import com.dlm.identity.service.AuditService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void saveAuditLog(
            Long userId,
            String action,
            String ipAddress) {

        AuditLog auditLog =
                AuditLog.builder()
                        .userId(userId)
                        .action(action)
                        .ipAddress(ipAddress)
                        .createdAt(LocalDateTime.now())
                        .build();

        auditLogRepository.save(auditLog);
    }
}