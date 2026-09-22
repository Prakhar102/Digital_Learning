package com.dlm.assessment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaderboardResponse {

    private Long userId;

    private Integer score;
}