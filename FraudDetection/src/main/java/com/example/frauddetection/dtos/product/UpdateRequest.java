package com.example.frauddetection.dtos.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRequest {
    private String name;
    private String category;
    private Float price;
    private String merchant;
    private Long stock;
}
