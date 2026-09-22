package com.dlm.identity.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.dlm.identity.security.CustomAccessDeniedHandler;
import com.dlm.identity.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC ENDPOINTS
                        .requestMatchers(
                                "/api/auth/**")
                        .permitAll()

                        // ADMIN
                        .requestMatchers(
                                "/api/admin/**")
                        .hasRole("ADMIN")

                        // INSTRUCTOR
                        .requestMatchers(
                                "/api/instructor/**")
                        .hasRole("INSTRUCTOR")

                        // LEARNER
                        .requestMatchers(
                                "/api/learner/**")
                        .hasRole("LEARNER")

                        // ALL AUTHENTICATED USERS
                        .requestMatchers(
                                "/api/users/**")
                        .authenticated()

                        .anyRequest()
                        .authenticated())

                .exceptionHandling(ex -> ex
                        .accessDeniedHandler(
                                customAccessDeniedHandler))

                .httpBasic(
                        Customizer.withDefaults());

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}