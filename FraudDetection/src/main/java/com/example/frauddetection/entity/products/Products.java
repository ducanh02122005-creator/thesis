package com.example.frauddetection.entity.products;

import com.example.frauddetection.entity.transaction.purchases.PurchasesItems;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Products {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false,length = 100)
    private String category;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Long stock;

    @Column(nullable = false)
    private String merchant;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = new Date();
    }


    @OneToMany(mappedBy = "productId")
    private List<PurchasesItems> purchasesItemsList;
}
