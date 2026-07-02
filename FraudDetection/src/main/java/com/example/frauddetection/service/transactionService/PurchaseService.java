package com.example.frauddetection.service.transactionService;

import com.example.frauddetection.dtos.transaction.PurchaseItemRequest;
import com.example.frauddetection.dtos.transaction.PurchaseRequest;
import com.example.frauddetection.dtos.transaction.PurchaseResponse;
import com.example.frauddetection.dtos.transaction.TransactionResponse;
import com.example.frauddetection.entity.prediction.FraudPrediction;
import com.example.frauddetection.entity.products.Products;
import com.example.frauddetection.entity.transaction.Transaction;
import com.example.frauddetection.entity.transaction.purchases.PurchaseStatus;
import com.example.frauddetection.entity.transaction.purchases.Purchases;
import com.example.frauddetection.entity.transaction.purchases.PurchasesItems;
import com.example.frauddetection.entity.user.User;
import com.example.frauddetection.repository.*;
import com.example.frauddetection.service.predictionService.AlertService;
import com.example.frauddetection.service.predictionService.FraudDetectionService;
import com.example.frauddetection.service.userSerivice.UserRiskProfileService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PurchaseRepository purchaseRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final TransactionService transactionService;

    public PurchaseResponse createPurchase(
            PurchaseRequest request) throws Exception {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        String email = Objects.requireNonNull(SecurityContextHolder.getContext()
                        .getAuthentication())
                .getName();
        Purchases purchase = Purchases.builder()
                .user(user)
                .status(PurchaseStatus.PAID)
                .totalAmount(0.0)
                .build();

        purchaseRepository.save(purchase);

        double totalAmount = 0;

        String transactionCategory = null;

        for (PurchaseItemRequest itemRequest : request.getItems()) {

            Products product = productRepository.findById(
                            itemRequest.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found"));

            if (product.getStock()
                    < itemRequest.getQuantity()) {

                throw new RuntimeException(
                        product.getName()
                                + " out of stock");
            }

            double itemTotal =
                    product.getPrice()
                            * itemRequest.getQuantity();

            PurchasesItems item =
                    PurchasesItems.builder()
                            .purchasesId(purchase)
                            .productId(product)
                            .quantity(itemRequest.getQuantity())
                            .unitPrice(product.getPrice())
                            .totalPrice(itemTotal)
                            .build();

            purchaseItemRepository.save(item);

            product.setStock(
                    product.getStock()
                            - itemRequest.getQuantity());

            productRepository.save(product);

            totalAmount += itemTotal;

            /*
             * Category cho model
             * Có thể lấy category sản phẩm đầu tiên
             */
            if (transactionCategory == null) {
                transactionCategory =
                        product.getCategory();
            }
        }

        purchase.setTotalAmount(totalAmount);

        purchaseRepository.save(purchase);

        TransactionResponse transactionResponse =
                transactionService.processTransaction(
                        purchase,
                        transactionCategory
                );

        return PurchaseResponse.builder()
                .purchaseId(purchase.getId())
                .transactionId(
                        transactionResponse.getTransactionId()
                )
                .totalAmount(totalAmount)
                .status(purchase.getStatus())
                .fraudProbability(
                        transactionResponse.getFraudProbability()
                )
                .fraudDetected(
                        transactionResponse.getFraud()
                )
//                .riskLevel(
//                        transactionResponse.getRiskLevel()
//                )
                .build();
    }
}