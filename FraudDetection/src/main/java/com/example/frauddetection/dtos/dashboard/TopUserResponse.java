package com.example.frauddetection.dtos.dashboard;

import com.example.frauddetection.entity.user.RiskLevel;
import com.example.frauddetection.entity.user.TrustLevel;
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

    private RiskLevel riskLevel;

    private Double trustScore;

    private TrustLevel trustLevel;
}
