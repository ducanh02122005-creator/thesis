package com.example.frauddetection.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopUserResponse {

    private Long userId;

    private String fullName;

    private Long fraudCount;

    private Double riskScore;
}
