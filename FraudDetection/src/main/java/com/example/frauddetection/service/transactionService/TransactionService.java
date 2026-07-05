package com.example.frauddetection.service.transactionService;

import com.example.frauddetection.dtos.prediction.PredictionRequest;
import com.example.frauddetection.dtos.transaction.PurchaseResponse;
import com.example.frauddetection.dtos.transaction.TransactionResponse;
import com.example.frauddetection.entity.prediction.FraudPrediction;
import com.example.frauddetection.entity.transaction.Transaction;
import com.example.frauddetection.entity.transaction.Decision;
import com.example.frauddetection.entity.transaction.purchases.Purchases;
import com.example.frauddetection.repository.PredictionRepository;
import com.example.frauddetection.repository.TransactionRepository;
import com.example.frauddetection.repository.UserRiskRepository;
import com.example.frauddetection.service.predictionService.AlertService;
import com.example.frauddetection.service.predictionService.FraudDetectionService;
import com.example.frauddetection.service.userSerivice.UserRiskProfileService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;
    private final PredictionRepository predictionRepository;
    private final UserRiskProfileService riskProfileService;
    private final UserRiskRepository userRiskRepository;
    private final AlertService alertService;
    public TransactionResponse processTransaction(
            Purchases purchase, String category) throws Exception {

        LocalDateTime now = LocalDateTime.now();

        // 1. Predict
        PredictionRequest predictionRequest = PredictionRequest.builder()
                .amount(purchase.getTotalAmount())
                .transHour(now.getHour())
                .category(category)
                .build();

        Double probability = fraudDetectionService.predict(predictionRequest);
        boolean fraud = probability >= 0.5;

        // 2. Build and save Transaction (populating fraud fields so it does not crash!)
        Transaction transaction = Transaction.builder()
                .purchases(purchase)
                .user(purchase.getUser())
                .amount(purchase.getTotalAmount())
                .category(category)
                .transactionTime(now)
                .TransHour(now.getHour())
                .day_of_week(now.getDayOfWeek().getValue())
                .month(now.getMonthValue())
                .fraudProbability(probability)
                .fraudDetected(fraud)
                .build();

        transaction = transactionRepository.save(transaction);

        // 3. Save FraudPrediction
        FraudPrediction prediction = FraudPrediction.builder()
                .transactionId(transaction)
                .fraudProbability(probability)
                .isFraud(fraud)
                .predictedAt(now)
                .build();

        predictionRepository.save(prediction);

        // 4. Update Risk Profile (counts the transaction we just saved!)
        riskProfileService.updateUserRisk(purchase.getUser().getId());

        // 5. Fetch profile and run Decision Engine
        com.example.frauddetection.entity.user.UserRiskProfile profile = userRiskRepository.findByUserId(purchase.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Risk profile not found"));

        com.example.frauddetection.entity.user.RiskLevel riskLevel = profile.getRiskLevel();
        com.example.frauddetection.entity.user.TrustLevel trustLevel = profile.getTrustLevel();

        Decision decision;
        if (riskLevel == com.example.frauddetection.entity.user.RiskLevel.LOW) {
            decision = Decision.APPROVE;
        } else if (riskLevel == com.example.frauddetection.entity.user.RiskLevel.MEDIUM) {
            if (trustLevel == com.example.frauddetection.entity.user.TrustLevel.EXCELLENT) {
                decision = Decision.APPROVE;
            } else {
                decision = Decision.REVIEW;
            }
        } else { // HIGH
            if (trustLevel == com.example.frauddetection.entity.user.TrustLevel.GOOD ||
                trustLevel == com.example.frauddetection.entity.user.TrustLevel.EXCELLENT) {
                decision = Decision.REVIEW;
            } else {
                decision = Decision.BLOCK;
            }
        }

        // 6. Update Transaction decision
        transaction.setDecision(decision);
        transaction = transactionRepository.save(transaction);

        // 7. Create Alert if fraud
        if (fraud) {
            alertService.createAlert(transaction, probability * 100);
        }

        return TransactionResponse.builder()
                .transactionId(transaction.getId())
                .fraudProbability(probability)
                .fraud(fraud)
                .decision(decision.name())
                .build();
    }
}
