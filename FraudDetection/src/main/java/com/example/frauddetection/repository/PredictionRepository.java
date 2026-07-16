package com.example.frauddetection.repository;

import com.example.frauddetection.entity.prediction.FraudPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PredictionRepository extends JpaRepository<FraudPrediction, Long> {
    java.util.Optional<FraudPrediction> findByTransactionId(com.example.frauddetection.entity.transaction.Transaction transactionId);
}
