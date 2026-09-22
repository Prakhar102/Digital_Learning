package com.dlm.assessment.dto;

import java.util.Map;

import lombok.Data;

@Data
public class AttemptRequest {

    private Long userId;

    private Long assessmentId;

    private Map<Long, String> answers;
}