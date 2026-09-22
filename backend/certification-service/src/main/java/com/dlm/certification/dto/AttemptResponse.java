package com.dlm.certification.dto;

import lombok.Data;

@Data
public class AttemptResponse {

    private Long userId;

    private Long assessmentId;

    private Integer score;

    private Boolean passed;
}