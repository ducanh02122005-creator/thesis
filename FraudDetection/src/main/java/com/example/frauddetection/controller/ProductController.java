package com.example.frauddetection.controller;

import com.example.frauddetection.dtos.product.ProductDTO;
import com.example.frauddetection.dtos.product.UpdateRequest;
import com.example.frauddetection.service.productService.ProductCRUDService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ProductController {
    private final ProductCRUDService service;

    @GetMapping("/products")
    public Iterable<ProductDTO> getAllProduct(){
        return service.getAllProduct();
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id){
        return service.getProduct(id);
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody ProductDTO data,
            UriComponentsBuilder uriComponentsBuilder){
        return service.createProduct(data,uriComponentsBuilder);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateRequest request
    ){
        return service.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id){
        return service.deleteProduct(id);
    }
}
