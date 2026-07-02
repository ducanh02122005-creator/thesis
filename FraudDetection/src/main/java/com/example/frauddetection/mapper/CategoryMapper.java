package com.example.frauddetection.mapper;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CategoryMapper {

    private final Map<String, Integer> categoryMap = Map.of(
            "food_dining",0,
            "gas_transport",1,
            "shopping_net",2
    );

    public Integer getIndex(String category){
        return categoryMap.getOrDefault(category,0);
    }
}
