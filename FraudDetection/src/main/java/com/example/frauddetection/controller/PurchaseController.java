package com.example.frauddetection.controller;

import com.example.frauddetection.dtos.transaction.PurchaseRequest;
import com.example.frauddetection.dtos.transaction.PurchaseResponse;
import com.example.frauddetection.service.transactionService.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class PurchaseController {
    private final PurchaseService service;

    @PostMapping("/purchase")
    public ResponseEntity<PurchaseResponse> purchase(@RequestBody PurchaseRequest data, UriComponentsBuilder builder) throws Exception {
        return ResponseEntity.ok(service.createPurchase(data));

    }
}
