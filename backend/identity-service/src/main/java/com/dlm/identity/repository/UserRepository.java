package com.dlm.identity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.dlm.identity.entity.User;
import com.dlm.identity.entity.Role;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    long countByRole(Role role);

    List<User> findByRole(Role role);
}