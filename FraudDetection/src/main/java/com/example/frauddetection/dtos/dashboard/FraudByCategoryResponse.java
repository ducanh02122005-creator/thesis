package com.example.frauddetection.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudByCategoryResponse {

    private String category;

    private Long fraudCount;
}
