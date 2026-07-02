package com.example.frauddetection.dtos.prediction;

import com.example.frauddetection.entity.prediction.AlertStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlertRequest {
    private Long alertId;
    private AlertStatus status;
}
