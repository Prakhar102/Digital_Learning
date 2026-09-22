package com.dlm.identity.controller;

//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dlm.identity.dto.AuthResponse;
import com.dlm.identity.dto.LoginRequest;
import com.dlm.identity.dto.LogoutRequest;
import com.dlm.identity.dto.RefreshTokenRequest;
import com.dlm.identity.dto.RegisterRequest;
import com.dlm.identity.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
// @CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    //private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refreshToken(@RequestBody RefreshTokenRequest request) {
        return authService.refreshToken(request);
    }


    @PostMapping("/logout")
    public String logout(@RequestBody LogoutRequest request) {
        authService.logout(request.getRefreshToken());
        return "Logged out successfully";
    }

    // @GetMapping("/service-token")
    // public String serviceToken() {

    //     return jwtUtil.generateServiceToken("CERTIFICATION-SERVICE");
    // }
}