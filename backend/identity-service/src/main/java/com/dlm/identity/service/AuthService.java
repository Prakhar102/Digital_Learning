package com.dlm.identity.service;

import com.dlm.identity.dto.AuthResponse;
import com.dlm.identity.dto.LoginRequest;
import com.dlm.identity.dto.RefreshTokenRequest;
import com.dlm.identity.dto.RegisterRequest;

public interface AuthService {

    String register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    //AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String refreshToken);

}