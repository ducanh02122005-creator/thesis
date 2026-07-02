package com.example.frauddetection.service.transactionService;

import com.example.frauddetection.dtos.prediction.PredictionRequest;
import com.example.frauddetection.dtos.transaction.PurchaseResponse;
import com.example.frauddetection.dtos.transaction.TransactionResponse;
import com.example.frauddetection.entity.prediction.FraudPrediction;
import com.example.frauddetection.entity.transaction.Transaction;
import com.example.frauddetection.entity.transaction.purchases.Purchases;
import com.example.frauddetection.repository.PredictionRepository;
import com.example.frauddetection.repository.TransactionRepository;
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
    private final AlertService alertService;
    private LocalDateTime date;
    public TransactionResponse processTransaction(
            Purchases purchase, String category) throws Exception {

        Transaction transaction = Transaction.builder()
                .purchases(purchase)
                .user(purchase.getUser())
                .amount(purchase.getTotalAmount())
                .category(category)
                .transactionTime(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);

        PredictionRequest predictionRequest =
                PredictionRequest.builder()
                        .amount(transaction.getAmount())
                        .transHour(
                                transaction.getTransactionTime().getHour()
                        )
                        .category(transaction.getCategory())
                        .build();

        Double probability =
                fraudDetectionService.predict(predictionRequest);

        boolean fraud = probability >= 0.5;

        FraudPrediction prediction =
                FraudPrediction.builder()
                        .transactionId(transaction)
                        .fraudProbability(probability)
                        .isFraud(fraud)
                        .predictedAt(LocalDateTime.now())
                        .build();

        predictionRepository.save(prediction);

        String riskLevel =
                riskProfileService.updateUserRisk(
                        purchase.getUser().getId());

        if (fraud) {

            alertService.createAlert(
                    transaction,
                    probability * 100
            );
        }

        return TransactionResponse.builder()
                .transactionId(transaction.getId())
                .fraudProbability(probability)
                .fraud(fraud)
                .build();
    }
}
