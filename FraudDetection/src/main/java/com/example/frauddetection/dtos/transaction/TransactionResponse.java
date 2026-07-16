package com.example.frauddetection.dtos.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponse {
    private Long transactionId;

    private Double fraudProbability;

    private Boolean fraud;

    private String decision;

    private Double amount;

    private String category;

    private java.time.LocalDateTime transactionTime;
}
