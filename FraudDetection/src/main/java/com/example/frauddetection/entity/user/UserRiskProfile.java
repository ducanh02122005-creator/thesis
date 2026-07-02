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

    private LocalDateTime updatedAt;
}
