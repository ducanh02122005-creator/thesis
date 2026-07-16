package com.example.frauddetection.repository;

import com.example.frauddetection.entity.transaction.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    long countByUserId(Long userId);

    long countByUserIdAndFraudDetectedTrue(Long userId);

    @Query("""
        SELECT COALESCE(AVG(t.fraudProbability),0)
        FROM Transaction t
        WHERE t.user.id = :userId
    """)
    Double averageFraudProbability(@Param("userId") Long userId);

    @Query(value = """
        SELECT COUNT(*)
        FROM transactions t
        WHERE t.user_id = :userId
        AND (
            HOUR(t.transaction_time) >= 22
            OR HOUR(t.transaction_time) < 6
        )
    """, nativeQuery = true)
    long countNightTransaction(@Param("userId") Long userId);

    java.util.List<Transaction> findByUserIdOrderByTransactionTimeDesc(Long userId);
}