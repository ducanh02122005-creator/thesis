package com.example.frauddetection.repository;

import com.example.frauddetection.entity.transaction.purchases.PurchasesItems;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseItemRepository extends JpaRepository<PurchasesItems,Long> {
}
