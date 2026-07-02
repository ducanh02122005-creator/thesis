package com.example.frauddetection.entity.transaction.purchases;

import com.example.frauddetection.entity.products.Products;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "purchases_items")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PurchasesItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "purchases_id")
    private Purchases purchasesId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Products productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Double totalPrice;
}
