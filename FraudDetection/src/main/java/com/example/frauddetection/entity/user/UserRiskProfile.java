package com.example.frauddetection.entity.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Data
@Builder
@Table(name = "user_risk_profiles")
@AllArgsConstructor
@NoArgsConstructor
public class UserRiskProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private Double riskScore;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    private Double trustScore;

    @Enumerated(EnumType.STRING)
    private TrustLevel trustLevel;

    @Builder.Default
    private Double accountAgeScore = 100.0;

    @Builder.Default
    private Double purchaseSuccessRateScore = 100.0;

    @Builder.Default
    private Double fraudHistoryScore = 100.0;

    @Builder.Default
    private Double verificationScore = 100.0;

    @Builder.Default
    private Double purchaseActivityScore = 100.0;

    private LocalDateTime updatedAt;
}
