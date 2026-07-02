package com.example.frauddetection.mapper;

import com.example.frauddetection.dtos.product.ProductDTO;
import com.example.frauddetection.dtos.product.UpdateRequest;
import com.example.frauddetection.entity.products.Products;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(source = "id",target = "id")
    @Mapping(source = "name",target = "name")
    @Mapping(source = "category",target = "category")
    @Mapping(source = "merchant", target = "merchant")
    @Mapping(source = "price",target = "price")
    @Mapping(source = "stock",target = "stock")
    ProductDTO toDto(Products products);

    Products toEntity(ProductDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(UpdateRequest request, @MappingTarget Products products);
}
