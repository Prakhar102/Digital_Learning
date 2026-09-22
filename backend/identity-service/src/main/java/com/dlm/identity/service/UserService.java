package com.dlm.identity.service;

import com.dlm.identity.dto.AdminStatsResponse;
import com.dlm.identity.dto.CreateInstructorRequest;
import com.dlm.identity.dto.DashboardStatsResponse;
import com.dlm.identity.dto.InstructorResponse;
import com.dlm.identity.dto.UserProfileResponse;
import com.dlm.identity.dto.UserResponse;
import java.util.List;

public interface UserService {

    UserProfileResponse getCurrentUser(String email);

    UserResponse getUserById(Long id);

    DashboardStatsResponse getDashboardStats();

    String createInstructor(CreateInstructorRequest request);

    AdminStatsResponse getAdminStats();

    List<InstructorResponse> getAllInstructors();

}