package com.dlm.identity.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.dlm.identity.entity.Role;
import com.dlm.identity.entity.User;
import com.dlm.identity.entity.UserStatus;
import com.dlm.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminSeeder
        implements CommandLineRunner {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        String adminEmail =
                "admin@dlm.com";

        if (!userRepository.existsByEmail(
                adminEmail)) {

            User admin =
                    User.builder()
                            .fullName(
                                    "System Admin")
                            .phoneNumber(
                                    "9999999999")
                            .email(
                                    adminEmail)
                            .password(
                                    passwordEncoder.encode(
                                            "Admin@123"))
                            .role(
                                    Role.ROLE_ADMIN)
                            .status(
                                    UserStatus.ACTIVE)
                            .failedLoginAttempts(
                                    0)
                            .build();

            userRepository.save(admin);

            System.out.println(
                    "Admin seeded successfully");
        }
    }
}