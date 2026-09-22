package com.dlm.identity.dto;

import com.dlm.identity.entity.Role;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private Long id;

    private String fullName;
    private String phoneNumber;

    private String email;

    private Role role;
}