package com.example.frauddetection.controller;

import com.example.frauddetection.dtos.dashboard.DashboardSummaryResponse;
import com.example.frauddetection.dtos.dashboard.FraudByCategoryResponse;
import com.example.frauddetection.dtos.dashboard.FraudByHourResponse;
import com.example.frauddetection.dtos.dashboard.TopUserResponse;
import com.example.frauddetection.dtos.prediction.AlertRequest;
import com.example.frauddetection.dtos.prediction.AlertResponse;
import com.example.frauddetection.service.dashbroadService.DashboardService;
import com.example.frauddetection.service.predictionService.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class AdminController {
    private final DashboardService dashboardService;
    private final AlertService alertService;


    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary() {
        return dashboardService.getSummary();
    }

    @GetMapping("/fraud-by-hour")
    public List<FraudByHourResponse> getFraudByHour() {
        return dashboardService.getFraudByHour();
    }

    @GetMapping("/fraud-by-category")
    public List<FraudByCategoryResponse> getFraudByCategory() {
        return dashboardService.getFraudByCategory();
    }

    @GetMapping("/top-users")
    public List<TopUserResponse> getTopUsers() {
        return dashboardService.getTopUsers();
    }

    @GetMapping("/all-users")
    public List<TopUserResponse> getAllUsersRisk() {
        return dashboardService.getAllUsersRisk();
    }

    @GetMapping("/alert")
    public List<AlertResponse> getAllAlerts(){return alertService.getAllAlerts();}

    @GetMapping("/openAlert")
    public List<AlertResponse> getOpenAlert(){return alertService.getOpenAlerts();}

    @PutMapping("/updateStatus")
    public AlertResponse updateStatus(@RequestBody AlertRequest request){
        return alertService.updateStatus(request);}
}
