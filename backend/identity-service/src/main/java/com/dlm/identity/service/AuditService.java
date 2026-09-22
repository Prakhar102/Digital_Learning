package com.dlm.identity.service;

public interface AuditService {

    void saveAuditLog(Long userId, String action, String ipAddress);

}