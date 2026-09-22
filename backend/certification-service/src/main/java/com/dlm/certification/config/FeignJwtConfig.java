package com.dlm.certification.config;

import feign.RequestInterceptor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignJwtConfig {

    @Value("${service.jwt.token}")
    private String serviceJwtToken;

    @Bean
    public RequestInterceptor requestInterceptor() {

        return template ->
                template.header(
                        "Authorization",
                        "Bearer " + serviceJwtToken
                );
    }
}