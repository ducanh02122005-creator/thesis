package com.example.frauddetection.dtos.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PredictionResponse {
    private Double fraudProbability;

    private Boolean fraud;
}
