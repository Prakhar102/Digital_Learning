package com.dlm.certification.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EligibilityResponse {

    private Long userId;
    private Long courseId;
    private Boolean eligible;
}