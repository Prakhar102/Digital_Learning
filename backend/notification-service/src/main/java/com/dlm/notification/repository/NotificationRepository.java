package com.dlm.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.notification.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);
}