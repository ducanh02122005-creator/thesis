package com.example.frauddetection.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudByHourResponse {

    private Integer hour;

    private Long fraudCount;
}
