package com.example.frauddetection.entity.transaction.purchases;

import com.example.frauddetection.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "purchases")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Purchases {

    @Id
    @GeneratedValue(
            strategy =
                    GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne

    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Enumerated(
            EnumType.STRING
    )
    private PurchaseStatus status =
            PurchaseStatus.PENDING;

    @Temporal(
            TemporalType.TIMESTAMP
    )
    @Column(
            nullable = false,
            updatable = false
    )
    private Date createdAt;


    @OneToMany(
            mappedBy = "purchasesId"
    )
    private List<PurchasesItems>
            purchasesItemsList;

    @PrePersist
    public void prePersist() {
        createdAt =
                new Date();
    }

}
