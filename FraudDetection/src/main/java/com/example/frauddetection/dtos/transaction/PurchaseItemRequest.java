package com.example.frauddetection.dtos.transaction;

import com.example.frauddetection.entity.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseItemRequest  {
    private Long productId;

    private Integer quantity;
}
