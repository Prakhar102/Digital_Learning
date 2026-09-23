package com.dlm.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateInstructorRequest {

    @NotBlank
    private String fullName;

    private String phoneNumber;

    @Email
    private String email;

    @NotBlank
    private String password;
}