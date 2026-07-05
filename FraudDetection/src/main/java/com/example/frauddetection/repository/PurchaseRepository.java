package com.example.frauddetection.repository;

import com.example.frauddetection.entity.transaction.purchases.Purchases;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchases, Long > {
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, com.example.frauddetection.entity.transaction.purchases.PurchaseStatus status);
}
