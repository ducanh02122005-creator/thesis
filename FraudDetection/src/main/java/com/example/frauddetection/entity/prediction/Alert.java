package com.example.frauddetection.entity.prediction;

import com.example.frauddetection.entity.transaction.Transaction;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "alerts")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "transaction_id")
    private Transaction transactionId;

    @Column
    private Double riskScore;

    @Enumerated(EnumType.STRING)
    @Column
    private AlertStatus status;

    @Column
    private LocalDateTime createdAt;
}
