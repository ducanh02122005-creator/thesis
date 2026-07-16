package com.example.frauddetection.service.userSerivice;

import com.example.frauddetection.dtos.riskProfiles.ProfilesResponse;
import com.example.frauddetection.entity.user.RiskLevel;
import com.example.frauddetection.entity.user.TrustLevel;
import com.example.frauddetection.entity.user.User;
import com.example.frauddetection.entity.user.UserRiskProfile;
import com.example.frauddetection.entity.prediction.AlertStatus;
import com.example.frauddetection.mapper.ProfilesMapper;
import com.example.frauddetection.repository.TransactionRepository;
import com.example.frauddetection.repository.UserRepository;
import com.example.frauddetection.repository.UserRiskRepository;
import com.example.frauddetection.repository.PurchaseRepository;
import com.example.frauddetection.repository.AlertRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Transactional
public class UserRiskProfileService {

    private final UserRiskRepository profileRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final AlertRepository alertRepository;
    private final ProfilesMapper mapper;

    private UserRiskProfile createProfile(User user) {
        UserRiskProfile profile = UserRiskProfile.builder()
                .user(user)
                .riskScore(0.0)
                .riskLevel(RiskLevel.LOW)
                .trustScore(100.0)
                .trustLevel(TrustLevel.EXCELLENT)
                .updatedAt(LocalDateTime.now())
                .build();

        return profileRepository.save(profile);
    }

    public ResponseEntity<ProfilesResponse> getUserProfiles(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    updateUserRisk(id);
                    UserRiskProfile profile = profileRepository.findByUserId(id)
                            .orElseGet(() -> createProfile(user));
                    return ResponseEntity.ok(mapper.toDto(profile));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public String updateUserRisk(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserRiskProfile profile = profileRepository
                .findByUserId(userId)
                .orElseGet(() -> createProfile(user));

        long total = transactionRepository.countByUserId(userId);

        long fraud = transactionRepository.countByUserIdAndFraudDetectedTrue(userId);

        Double avgProbability = transactionRepository.averageFraudProbability(userId);
        avgProbability = (avgProbability == null) ? 0.0 : avgProbability;

        long night = transactionRepository.countNightTransaction(userId);

        double fraudRate = total == 0 ? 0 : (fraud * 100.0 / total);
        double nightRate = total == 0 ? 0 : (night * 100.0 / total);
        double frequency = Math.min(total, 100);

        double score =
                fraudRate * 0.40 +
                        avgProbability * 100 * 0.30 +
                        nightRate * 0.20 +
                        frequency * 0.10;

        profile.setRiskScore(score);
        profile.setUpdatedAt(LocalDateTime.now());

        if (score <= 30) {
            profile.setRiskLevel(RiskLevel.LOW);
        } else if (score <= 70) {
            profile.setRiskLevel(RiskLevel.MEDIUM);
        } else {
            profile.setRiskLevel(RiskLevel.HIGH);
        }

        // Calculate Trust Score components
        double ageDays = user.getCreatedAt() != null ? ChronoUnit.DAYS.between(user.getCreatedAt(), LocalDateTime.now()) : 30.0;
        double creationScore = Math.min(ageDays, 180.0) * 100.0 / 180.0;
        double physicalAgeScore = user.getAge() != null ? Math.min(user.getAge() * 2.5, 100.0) : 60.0;
        double A = (creationScore * 0.6) + (physicalAgeScore * 0.4);

        long totalPurchases = purchaseRepository.countByUserId(userId);
        long successfulPurchases = purchaseRepository.countByUserIdAndStatus(userId, com.example.frauddetection.entity.transaction.purchases.PurchaseStatus.PAID);
        double S = totalPurchases == 0 ? 100.0 : (successfulPurchases * 100.0 / totalPurchases);

        long confirmedFraudCount = alertRepository.countByUserIdAndStatus(userId, AlertStatus.CONFIRMED);
        double H = Math.max(0.0, 100.0 - (confirmedFraudCount * 25.0));

        double V = (user.getIsEmailVerified() != null && user.getIsEmailVerified() ? 50.0 : 0.0) + (user.getIsPhoneVerified() != null && user.getIsPhoneVerified() ? 50.0 : 0.0);

        double P = Math.min(totalPurchases * 10.0, 100.0);

        double tScore = (A * 0.20) + (S * 0.30) + (H * 0.30) + (V * 0.10) + (P * 0.10);
        profile.setTrustScore(tScore);

        profile.setAccountAgeScore(A);
        profile.setPurchaseSuccessRateScore(S);
        profile.setFraudHistoryScore(H);
        profile.setVerificationScore(V);
        profile.setPurchaseActivityScore(P);

        if (tScore >= 90.0) {
            profile.setTrustLevel(TrustLevel.EXCELLENT);
        } else if (tScore >= 75.0) {
            profile.setTrustLevel(TrustLevel.GOOD);
        } else if (tScore >= 50.0) {
            profile.setTrustLevel(TrustLevel.AVERAGE);
        } else {
            profile.setTrustLevel(TrustLevel.POOR);
        }

        profileRepository.save(profile);

        return profile.getRiskLevel().name();
    }

    public ResponseEntity<ProfilesResponse> verifyEmail(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setIsEmailVerified(true);
                    userRepository.save(user);
                    updateUserRisk(id);
                    UserRiskProfile profile = profileRepository.findByUserId(id)
                            .orElseGet(() -> createProfile(user));
                    return ResponseEntity.ok(mapper.toDto(profile));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<ProfilesResponse> verifyPhone(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setIsPhoneVerified(true);
                    userRepository.save(user);
                    updateUserRisk(id);
                    UserRiskProfile profile = profileRepository.findByUserId(id)
                            .orElseGet(() -> createProfile(user));
                    return ResponseEntity.ok(mapper.toDto(profile));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}