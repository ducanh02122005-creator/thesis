package com.example.frauddetection.entity.prediction;

import com.example.frauddetection.entity.transaction.Transaction;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "fraud_predictions")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FraudPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "transaction_id")
    private Transaction transactionId;

    @Column
    private Double fraudProbability;

    @Column
    private Boolean isFraud;

    @Column
    private LocalDateTime predictedAt;
}
