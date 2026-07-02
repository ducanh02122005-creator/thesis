package com.example.frauddetection.dtos.riskProfiles;

import com.example.frauddetection.entity.user.RiskLevel;
import com.example.frauddetection.entity.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfilesResponse {
    private Long userId;
    private Long riskScore;
    private RiskLevel riskLevel;
}
