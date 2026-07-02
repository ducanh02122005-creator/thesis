package com.example.frauddetection.dtos.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {
    private Long totalTransactions;
    private Long totalFraudTransactions;
    private Long totalNormalTransactions;
    private Double totalAmount;
}
