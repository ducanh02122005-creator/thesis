package com.example.frauddetection.service.userSerivice;

import com.example.frauddetection.dtos.riskProfiles.ProfilesResponse;
import com.example.frauddetection.entity.user.RiskLevel;
import com.example.frauddetection.entity.user.User;
import com.example.frauddetection.entity.user.UserRiskProfile;
import com.example.frauddetection.mapper.ProfilesMapper;
import com.example.frauddetection.repository.TransactionRepository;
import com.example.frauddetection.repository.UserRepository;
import com.example.frauddetection.repository.UserRiskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserRiskProfileService {

    private final UserRiskRepository profileRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ProfilesMapper mapper;

    private UserRiskProfile createProfile(User user) {
        UserRiskProfile profile = UserRiskProfile.builder()
                .user(user)
                .riskScore(0.0)
                .riskLevel(RiskLevel.LOW)
                .updatedAt(LocalDateTime.now())
                .build();

        return profileRepository.save(profile);
    }

    public ResponseEntity<ProfilesResponse> getUserProfiles(Long id) {

        return profileRepository.findByUserId(id)
                .map(profile -> ResponseEntity.ok(mapper.toDto(profile)))
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

        profileRepository.save(profile);

        return profile.getRiskLevel().name();
    }
}