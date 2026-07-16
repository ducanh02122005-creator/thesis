package com.example.frauddetection.controller;

import com.example.frauddetection.dtos.riskProfiles.ProfilesResponse;
import com.example.frauddetection.service.userSerivice.UserRiskProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/users/{id}/risk-profile")
public class RiskProfilesController {
    private final UserRiskProfileService service;

    @GetMapping
    public ResponseEntity<ProfilesResponse> getUserProfiles(@PathVariable Long id){
        return service.getUserProfiles(id);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ProfilesResponse> verifyEmail(@PathVariable Long id) {
        return service.verifyEmail(id);
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<ProfilesResponse> verifyPhone(@PathVariable Long id) {
        return service.verifyPhone(id);
    }
}
