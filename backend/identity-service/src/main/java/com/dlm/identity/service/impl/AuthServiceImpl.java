package com.dlm.identity.service.impl;

import java.time.LocalDateTime;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.dlm.identity.dto.AuthResponse;
import com.dlm.identity.dto.LoginRequest;
import com.dlm.identity.dto.RefreshTokenRequest;
import com.dlm.identity.dto.RegisterRequest;
import com.dlm.identity.entity.RefreshToken;
import com.dlm.identity.entity.Role;
import com.dlm.identity.entity.User;
import com.dlm.identity.entity.UserStatus;
import com.dlm.identity.exception.InvalidCredentialsException;
import com.dlm.identity.exception.InvalidRefreshTokenException;
import com.dlm.identity.exception.UserNotFoundException;
import com.dlm.identity.repository.RefreshTokenRepository;
import com.dlm.identity.repository.UserRepository;
import com.dlm.identity.service.AuditService;
import com.dlm.identity.service.AuthService;
import com.dlm.identity.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditService auditService;


    // REGISTER
    @Override
    public String register(RegisterRequest request) {

       if (userRepository.existsByEmail(request.getEmail())) {

            return "Email already exists";
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {

            return "Phone number already exists";
        }

        User user = User.builder()
        .fullName(request.getFullName())
        .phoneNumber(request.getPhoneNumber())
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))
        .role(Role.ROLE_LEARNER)
        .status(UserStatus.ACTIVE)
        .createdAt(LocalDateTime.now())
        .failedLoginAttempts(0)
        .lockedUntil(null)
        .build();

        userRepository.save(user);

        auditService.saveAuditLog(
                user.getId(),
                "REGISTER",
                "127.0.0.1"
        );

        return "User registered successfully";
    }

    // LOGIN
    @Override
public AuthResponse login(LoginRequest request) {

    User user = userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {

        throw new InvalidCredentialsException("Account is temporarily locked");
    }

    boolean match = passwordEncoder.matches(request.getPassword(), user.getPassword());

    if (!match) {

        int attempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();

        attempts++;

        user.setFailedLoginAttempts(attempts);

        if (attempts >= 5) {

                user.setLockedUntil(LocalDateTime.now().plusMinutes(15));

                auditService.saveAuditLog(user.getId(), "ACCOUNT_LOCKED", "127.0.0.1");
        }

        userRepository.save(user);

        auditService.saveAuditLog(user.getId(), "LOGIN_FAILED", "127.0.0.1");

        throw new InvalidCredentialsException("Invalid credentials");
    }

    // Successful login, reset counter
    user.setFailedLoginAttempts(0);
    user.setLockedUntil(null);

    userRepository.save(user);

    String accessToken = jwtUtil.generateToken(user.getEmail());

    String refreshTokenValue = jwtUtil.generateRefreshToken();

    RefreshToken refreshToken =
            RefreshToken.builder()
                    .token(refreshTokenValue)
                    .user(user)
                    .revoked(false)
                    .expiryDate(LocalDateTime.now().plusDays(7))
                    .build();

    refreshTokenRepository.save(refreshToken);

    auditService.saveAuditLog(user.getId(), "LOGIN_SUCCESS", "127.0.0.1");

    return new AuthResponse(accessToken, refreshTokenValue, "Bearer");
}

// REFRESH TOKEN
   @Override
public AuthResponse refreshToken(
        RefreshTokenRequest request) {

    RefreshToken refreshToken =
            refreshTokenRepository
                    .findByToken(request.getRefreshToken())
                    .orElseThrow(() ->new InvalidRefreshTokenException("Refresh token not found"));

    if (refreshToken.isRevoked()) {
        throw new InvalidRefreshTokenException("Refresh token revoked");
    }

    if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {

        throw new InvalidRefreshTokenException("Refresh token expired");
    }

    String accessToken = jwtUtil.generateToken(refreshToken.getUser().getEmail());

    auditService.saveAuditLog(refreshToken.getUser().getId(), "TOKEN_REFRESH", "127.0.0.1");

    return new AuthResponse(
            accessToken,
            refreshToken.getToken(),
            "Bearer"
    );
}

// LOGOUT
    @Override
public void logout(String refreshTokenValue) {

    RefreshToken refreshToken =
            refreshTokenRepository
                    .findByToken(refreshTokenValue)
                    .orElseThrow(() ->new InvalidRefreshTokenException("Refresh token not found"));

    refreshToken.setRevoked(true);

    refreshTokenRepository.save(refreshToken);

    auditService.saveAuditLog(refreshToken.getUser().getId(), "LOGOUT", "127.0.0.1");
}
}