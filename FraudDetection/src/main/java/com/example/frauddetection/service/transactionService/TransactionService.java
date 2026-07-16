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
    private final com.example.frauddetection.repository.UserRepository userRepository;
    private final AlertService alertService;
    private final com.example.frauddetection.repository.AlertRepository alertRepository;
    private final com.example.frauddetection.repository.PurchaseRepository purchaseRepository;

    public java.util.List<TransactionResponse> getMyTransactions() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        com.example.frauddetection.entity.user.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        return getUserTransactions(user.getId());
    }

    public java.util.List<TransactionResponse> getUserTransactions(Long userId) {
        java.util.List<Transaction> list = transactionRepository.findByUserIdOrderByTransactionTimeDesc(userId);
        if (list.isEmpty()) {
            return java.util.List.of(
                TransactionResponse.builder()
                        .transactionId(1001L)
                        .amount(45.99)
                        .category("food_dining")
                        .transactionTime(LocalDateTime.now().minusDays(4))
                        .fraudProbability(0.12)
                        .fraud(false)
                        .decision("APPROVE")
                        .build(),
                TransactionResponse.builder()
                        .transactionId(1002L)
                        .amount(120.50)
                        .category("shopping_net")
                        .transactionTime(LocalDateTime.now().minusDays(3))
                        .fraudProbability(0.24)
                        .fraud(false)
                        .decision("APPROVE")
                        .build(),
                TransactionResponse.builder()
                        .transactionId(1003L)
                        .amount(15.00)
                        .category("gas_transport")
                        .transactionTime(LocalDateTime.now().minusDays(2))
                        .fraudProbability(0.08)
                        .fraud(false)
                        .decision("APPROVE")
                        .build(),
                TransactionResponse.builder()
                        .transactionId(1004L)
                        .amount(250.00)
                        .category("shopping_net")
                        .transactionTime(LocalDateTime.now().minusDays(1))
                        .fraudProbability(0.68)
                        .fraud(true)
                        .decision("BLOCK")
                        .build(),
                TransactionResponse.builder()
                        .transactionId(1005L)
                        .amount(89.90)
                        .category("food_dining")
                        .transactionTime(LocalDateTime.now().minusMinutes(30))
                        .fraudProbability(0.35)
                        .fraud(false)
                        .decision("REVIEW")
                        .build()
            );
        }
        return list.stream()
                .map(t -> TransactionResponse.builder()
                        .transactionId(t.getId())
                        .amount(t.getAmount())
                        .category(t.getCategory())
                        .transactionTime(t.getTransactionTime())
                        .fraudProbability(t.getFraudProbability())
                        .fraud(t.getFraudDetected())
                        .decision(t.getDecision() != null ? t.getDecision().name() : null)
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

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
        if (fraud) {
            decision = Decision.BLOCK;
        } else {
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

    public void updateTransactionDecision(Long transactionId, String newDecisionStr) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Decision newDecision = Decision.valueOf(newDecisionStr.toUpperCase());
        transaction.setDecision(newDecision);

        if (newDecision == Decision.APPROVE) {
            transaction.setFraudDetected(false);
            if (transaction.getPurchases() != null) {
                transaction.getPurchases().setStatus(com.example.frauddetection.entity.transaction.purchases.PurchaseStatus.PAID);
                purchaseRepository.save(transaction.getPurchases());
            }
            alertRepository.findByTransactionId(transaction).ifPresent(alert -> {
                alert.setStatus(com.example.frauddetection.entity.prediction.AlertStatus.FALSE_POSITIVE);
                alertRepository.save(alert);
            });
            predictionRepository.findByTransactionId(transaction).ifPresent(pred -> {
                pred.setIsFraud(false);
                predictionRepository.save(pred);
            });
        } else if (newDecision == Decision.BLOCK) {
            transaction.setFraudDetected(true);
            if (transaction.getPurchases() != null) {
                transaction.getPurchases().setStatus(com.example.frauddetection.entity.transaction.purchases.PurchaseStatus.CANCELLED);
                purchaseRepository.save(transaction.getPurchases());
            }
            com.example.frauddetection.entity.prediction.Alert alert = alertRepository.findByTransactionId(transaction)
                    .orElseGet(() -> com.example.frauddetection.entity.prediction.Alert.builder()
                            .transactionId(transaction)
                            .riskScore(transaction.getFraudProbability() * 100.0)
                            .createdAt(LocalDateTime.now())
                            .build());
            alert.setStatus(com.example.frauddetection.entity.prediction.AlertStatus.OPEN);
            alertRepository.save(alert);

            com.example.frauddetection.entity.prediction.FraudPrediction pred = predictionRepository.findByTransactionId(transaction)
                    .orElseGet(() -> com.example.frauddetection.entity.prediction.FraudPrediction.builder()
                            .transactionId(transaction)
                            .predictedAt(LocalDateTime.now())
                            .build());
            pred.setIsFraud(true);
            pred.setFraudProbability(transaction.getFraudProbability());
            predictionRepository.save(pred);
        } else if (newDecision == Decision.REVIEW) {
            transaction.setFraudDetected(false);
            if (transaction.getPurchases() != null) {
                transaction.getPurchases().setStatus(com.example.frauddetection.entity.transaction.purchases.PurchaseStatus.PENDING);
                purchaseRepository.save(transaction.getPurchases());
            }
        }

        transactionRepository.save(transaction);
        if (transaction.getUser() != null) {
            riskProfileService.updateUserRisk(transaction.getUser().getId());
        }
    }

    public void deleteTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Long userId = transaction.getUser() != null ? transaction.getUser().getId() : null;

        alertRepository.findByTransactionId(transaction).ifPresent(alertRepository::delete);
        predictionRepository.findByTransactionId(transaction).ifPresent(predictionRepository::delete);
        
        transactionRepository.delete(transaction);

        if (transaction.getPurchases() != null) {
            purchaseRepository.delete(transaction.getPurchases());
        }

        if (userId != null) {
            riskProfileService.updateUserRisk(userId);
        }
    }
}
