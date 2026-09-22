package com.dlm.identity.service.impl;

import org.springframework.stereotype.Service;

import com.dlm.identity.dto.DashboardStatsResponse;
import com.dlm.identity.dto.InstructorResponse;
import com.dlm.identity.dto.UserProfileResponse;
import com.dlm.identity.dto.UserResponse;
import com.dlm.identity.entity.User;
import com.dlm.identity.exception.ResourceNotFoundException;
import com.dlm.identity.repository.UserRepository;
import com.dlm.identity.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.dlm.identity.dto.AdminStatsResponse;
import com.dlm.identity.dto.CreateInstructorRequest;
import com.dlm.identity.entity.Role;
import com.dlm.identity.entity.UserStatus;
import lombok.RequiredArgsConstructor;
import java.util.List;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserProfileResponse getCurrentUser(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        return UserProfileResponse.builder()
        .id(user.getId())
        .fullName(user.getFullName())
        .phoneNumber(user.getPhoneNumber())
        .email(user.getEmail())
        .role(user.getRole())
        .build();
    }

        @Override
        public UserResponse getUserById(Long id) {

                User user = userRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"));

                return UserResponse.builder()
        .id(user.getId())
        .fullName(user.getFullName())
        .phoneNumber(user.getPhoneNumber())
        .email(user.getEmail())
        .role(user.getRole())
        .build();
        }

        @Override
        public DashboardStatsResponse getDashboardStats() {

        return DashboardStatsResponse.builder()
                .enrolledCourses(12L)
                .completedAssessments(8L)
                .certificatesEarned(3L)
                .learningHours(48L)
                .build();
        }


        @Override
        public String createInstructor(
        CreateInstructorRequest request) {

        if (userRepository.existsByEmail(
                request.getEmail())) {

                return "Email already exists";
        }

        User instructor =
                User.builder()
                        .fullName(
                                request.getFullName())
                        .phoneNumber(
                                request.getPhoneNumber())
                        .email(
                                request.getEmail())
                        .password(
                                passwordEncoder.encode(
                                        request.getPassword()))
                        .role(
                                Role.ROLE_INSTRUCTOR)
                        .status(
                                UserStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .build();

        userRepository.save(instructor);

        return "Instructor Created Successfully";
        }


        @Override
        public AdminStatsResponse getAdminStats() {

        return AdminStatsResponse.builder()
                .totalLearners(
                        userRepository.countByRole(
                                Role.ROLE_LEARNER))
                .totalInstructors(
                        userRepository.countByRole(
                                Role.ROLE_INSTRUCTOR))
                .totalAdmins(
                        userRepository.countByRole(
                                Role.ROLE_ADMIN))
                .build();
        }



        @Override
        public List<InstructorResponse> getAllInstructors() {

        return userRepository
                .findByRole(
                        Role.ROLE_INSTRUCTOR)
                .stream()
                .map(user ->
                        InstructorResponse
                                .builder()
                                .id(user.getId())
                                .fullName(
                                        user.getFullName())
                                .email(
                                        user.getEmail())
                                .phoneNumber(
                                        user.getPhoneNumber())
                                .build())
                .toList();
        }
}