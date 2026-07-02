package com.example.frauddetection.dtos.riskProfiles;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfilesRequest {
    private Long userId;
}
