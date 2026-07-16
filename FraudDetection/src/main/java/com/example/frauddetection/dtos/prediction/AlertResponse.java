package com.example.frauddetection.dtos.prediction;

import com.example.frauddetection.entity.prediction.AlertStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlertResponse {

    private Long alertId;

    private Long transactionId;

    private Double riskScore;

    private AlertStatus status;

    private String note;

    private Long userId;

    private LocalDateTime createdAt;
}
