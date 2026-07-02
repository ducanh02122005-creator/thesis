package com.example.frauddetection.controller;

import com.example.frauddetection.dtos.riskProfiles.ProfilesResponse;
import com.example.frauddetection.service.userSerivice.UserRiskProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/users/{id}/risk-profile")
public class RiskProfilesController {
    private final UserRiskProfileService service;

    @GetMapping
    public ResponseEntity<ProfilesResponse> getUserProfiles(@PathVariable Long id){
        return service.getUserProfiles(id);
    }
}
