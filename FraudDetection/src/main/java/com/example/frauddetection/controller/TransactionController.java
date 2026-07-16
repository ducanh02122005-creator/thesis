package com.example.frauddetection.controller;

import com.example.frauddetection.dtos.transaction.TransactionResponse;
import com.example.frauddetection.service.transactionService.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping("/me")
    public List<TransactionResponse> getMyTransactions() {
        return transactionService.getMyTransactions();
    }

    @GetMapping("/user/{userId}")
    public List<TransactionResponse> getUserTransactions(@PathVariable Long userId) {
        return transactionService.getUserTransactions(userId);
    }

    @PutMapping("/{id}/decision")
    public ResponseEntity<Void> updateTransactionDecision(
            @PathVariable Long id,
            @RequestParam String decision
    ) {
        transactionService.updateTransactionDecision(id, decision);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }
}
