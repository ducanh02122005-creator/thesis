package com.example.frauddetection.entity.transaction;


import com.example.frauddetection.entity.transaction.purchases.Purchases;
import com.example.frauddetection.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name="transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    @OneToOne
    @JoinColumn(name = "purchase_id")
    private Purchases purchases;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String category;

    @Column(name = "hour")
    private Integer TransHour;

    @Column
    private Integer day_of_week;

    @Column
    private Integer month;

    @Column
    private LocalDateTime transactionTime;

    @Column(nullable = false)
    private Double fraudProbability;

    @Column(nullable = false)
    private Boolean fraudDetected;

    @Enumerated(EnumType.STRING)
    private Decision decision;
}
