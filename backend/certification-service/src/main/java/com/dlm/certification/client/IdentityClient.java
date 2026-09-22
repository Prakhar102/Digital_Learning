package com.dlm.certification.client;

import com.dlm.certification.config.FeignJwtConfig;
import com.dlm.certification.dto.UserResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "IDENTITY-SERVICE",
        configuration = FeignJwtConfig.class
)
public interface IdentityClient {

    @GetMapping("/api/users/{id}")
    UserResponse getUserById(@PathVariable Long id);
}