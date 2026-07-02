package com.example.frauddetection.repository;

import com.example.frauddetection.dtos.dashboard.FraudByCategoryResponse;
import com.example.frauddetection.dtos.dashboard.FraudByHourResponse;
import com.example.frauddetection.dtos.dashboard.TopUserResponse;
import com.example.frauddetection.entity.transaction.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<Transaction, Long> {

    @Query("""
        SELECT COUNT(t)
        FROM Transaction t
    """)
    Long countTransactions();

    @Query("""
        SELECT COUNT(fp)
        FROM FraudPrediction fp
        WHERE fp.isFraud = true
    """)
    Long countFrauds();

    @Query("""
        SELECT COUNT(a)
        FROM Alert a
    """)
    Long countAlerts();

    @Query("""
        SELECT COUNT(u)
        FROM UserRiskProfile u
        WHERE u.riskLevel = 'HIGH'
    """)
    Long countHighRiskUsers();

    @Query("""
SELECT new com.example.frauddetection.dtos.dashboard.FraudByHourResponse(
    t.TransHour,
    COUNT(fp.id)
)
FROM FraudPrediction fp
JOIN fp.transactionId t
WHERE fp.isFraud = true
GROUP BY t.TransHour
ORDER BY t.TransHour
""")
    List<FraudByHourResponse> getFraudByHour();

    @Query("""
SELECT new com.example.frauddetection.dtos.dashboard.FraudByCategoryResponse(
    t.category,
    COUNT(fp.id)
)
FROM FraudPrediction fp
JOIN fp.transactionId t
WHERE fp.isFraud = true
GROUP BY t.category
ORDER BY COUNT(fp.id) DESC
""")
    List<FraudByCategoryResponse> getFraudByCategory();
    @Query("""
SELECT new com.example.frauddetection.dtos.dashboard.TopUserResponse(
    u.id,
    u.fullName,
    COUNT(fp.id),
    urp.riskScore
)
FROM FraudPrediction fp
JOIN fp.transactionId t
JOIN t.user u
JOIN UserRiskProfile urp
    ON urp.user.id = u.id
WHERE fp.isFraud = true
GROUP BY u.id, u.fullName, urp.riskScore
ORDER BY COUNT(fp.id) DESC
""")
    List<TopUserResponse> getTopUsers(Pageable pageable);
}
