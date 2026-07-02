package com.example.frauddetection.dtos.transaction;

import com.example.frauddetection.entity.transaction.purchases.PurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseResponse {

    private Long purchaseId;

    private Double totalAmount;

    private PurchaseStatus status;

    private Long transactionId;

    private Double fraudProbability;

    private Boolean fraudDetected;

    private String riskLevel;
}
