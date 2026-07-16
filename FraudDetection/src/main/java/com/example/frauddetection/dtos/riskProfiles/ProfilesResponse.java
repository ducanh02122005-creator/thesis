package com.example.frauddetection.dtos.riskProfiles;

import com.example.frauddetection.entity.user.RiskLevel;
import com.example.frauddetection.entity.user.TrustLevel;
import com.example.frauddetection.entity.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfilesResponse {
    private Long userId;
    private Double riskScore;
    private RiskLevel riskLevel;
    private Double trustScore;
    private TrustLevel trustLevel;

    private Double accountAgeScore;
    private Double purchaseSuccessRateScore;
    private Double fraudHistoryScore;
    private Double verificationScore;
    private Double purchaseActivityScore;

    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;

    private String phoneNumber;
    private String email;
    private Integer age;
}
