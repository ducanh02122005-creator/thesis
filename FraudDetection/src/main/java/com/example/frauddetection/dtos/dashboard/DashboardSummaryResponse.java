package com.example.frauddetection.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryResponse {

    private Long totalTransactions;

    private Long totalFrauds;

    private Double fraudRate;

    private Long totalAlerts;

    private Long highRiskUsers;
}