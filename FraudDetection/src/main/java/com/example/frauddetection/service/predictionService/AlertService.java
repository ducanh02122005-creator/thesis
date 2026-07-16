package com.example.frauddetection.service.predictionService;

import com.example.frauddetection.dtos.prediction.AlertRequest;
import com.example.frauddetection.dtos.prediction.AlertResponse;
import com.example.frauddetection.entity.prediction.Alert;
import com.example.frauddetection.entity.prediction.AlertStatus;
import com.example.frauddetection.entity.transaction.Transaction;
import com.example.frauddetection.repository.AlertRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AlertService {

    private final AlertRepository alertRepository;

    public Alert createAlert(
            Transaction transaction,
            Double riskScore) {

        Alert alert = Alert.builder()
                .transactionId(transaction)
                .riskScore(riskScore)
                .status(AlertStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        return alertRepository.save(alert);
    }

    public AlertResponse getAlert(Long id) {

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Alert not found"));

        return mapToResponse(alert);
    }

    public List<AlertResponse> getAllAlerts() {

        return alertRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<AlertResponse> getOpenAlerts() {

        return alertRepository.findByStatus(
                        AlertStatus.OPEN)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AlertResponse updateStatus(AlertRequest request) {

        Alert alert = alertRepository.findById(request.getAlertId())
                .orElseThrow(() ->
                        new RuntimeException("Alert not found"));

        alert.setStatus(request.getStatus());


        alertRepository.save(alert);

        return mapToResponse(alert);
    }

    private AlertResponse mapToResponse(Alert alert) {

        return AlertResponse.builder()
                .alertId(alert.getId())
                .transactionId(
                        alert.getTransactionId().getId()
                )
                .riskScore(alert.getRiskScore())
                .status(alert.getStatus())
                .userId(alert.getTransactionId().getUser().getId())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
