package com.dlm.identity.dto;

import lombok.Data;

@Data
public class LogoutRequest {

    private String refreshToken;

}