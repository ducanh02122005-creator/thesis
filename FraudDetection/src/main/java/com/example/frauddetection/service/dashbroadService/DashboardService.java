package com.example.frauddetection.service.dashbroadService;

import com.example.frauddetection.dtos.dashboard.DashboardSummaryResponse;
import com.example.frauddetection.dtos.dashboard.FraudByCategoryResponse;
import com.example.frauddetection.dtos.dashboard.FraudByHourResponse;
import com.example.frauddetection.dtos.dashboard.TopUserResponse;
import com.example.frauddetection.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardSummaryResponse getSummary() {

        Long totalTransactions =
                dashboardRepository.countTransactions();

        Long totalFrauds =
                dashboardRepository.countFrauds();

        Long totalAlerts =
                dashboardRepository.countAlerts();

        Long highRiskUsers =
                dashboardRepository.countHighRiskUsers();

        double fraudRate = totalTransactions == 0
                ? 0
                : ((double) totalFrauds / totalTransactions) * 100;

        return DashboardSummaryResponse.builder()
                .totalTransactions(totalTransactions)
                .totalFrauds(totalFrauds)
                .fraudRate(fraudRate)
                .totalAlerts(totalAlerts)
                .highRiskUsers(highRiskUsers)
                .build();
    }

    public List<FraudByHourResponse> getFraudByHour() {
        return dashboardRepository.getFraudByHour();
    }

    public List<FraudByCategoryResponse> getFraudByCategory() {
        return dashboardRepository.getFraudByCategory();
    }

    public List<TopUserResponse> getTopUsers() {

        Pageable pageable = PageRequest.of(0, 10);

        return dashboardRepository.getTopUsers(pageable);
    }

    public List<TopUserResponse> getAllUsersRisk() {
        List<TopUserResponse> raw = dashboardRepository.getAllUsersRisk();
        for (TopUserResponse r : raw) {
            if (r.getRiskScore() == null) r.setRiskScore(0.0);
            if (r.getRiskLevel() == null) r.setRiskLevel(com.example.frauddetection.entity.user.RiskLevel.LOW);
            if (r.getTrustScore() == null) r.setTrustScore(100.0);
            if (r.getTrustLevel() == null) r.setTrustLevel(com.example.frauddetection.entity.user.TrustLevel.EXCELLENT);
        }
        return raw;
    }
}
