package com.example.frauddetection.service.productService;

import com.example.frauddetection.dtos.product.ProductDTO;
import com.example.frauddetection.dtos.product.UpdateRequest;
import com.example.frauddetection.entity.products.Products;
import com.example.frauddetection.mapper.ProductMapper;
import com.example.frauddetection.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class ProductCRUDService {

    private final ProductMapper mapper;

    private final ProductRepository repository;


    public Iterable<ProductDTO> getAllProduct() {

        return repository.findAll(
                        Sort.by("name")
                )
                .stream()
                .map(mapper::toDto)
                .toList();
    }


    public ResponseEntity<ProductDTO> getProduct(
            Long id
    ) {

        return repository.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound()
                                .build()
                );
    }


    public ResponseEntity<ProductDTO> createProduct(
            ProductDTO data,
            UriComponentsBuilder builder
    ) {

        Products product =
                mapper.toEntity(data);
        Date timestamp;
        product.setId(null);

        Products saved =
                repository.save(product);

        ProductDTO response =
                mapper.toDto(saved);

        var uri =
                builder
                        .path("/products/{id}")
                        .buildAndExpand(saved.getId())
                        .toUri();

        return ResponseEntity
                .created(uri)
                .body(response);
    }


    public ResponseEntity<ProductDTO> updateProduct(
            Long id,
            UpdateRequest request
    ) {

        var product =
                repository.findById(id);

        if (product.isEmpty()) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        mapper.update(
                request,
                product.get()
        );

        Products updated =
                repository.save(
                        product.get()
                );

        return ResponseEntity.ok(
                mapper.toDto(updated)
        );
    }


    public ResponseEntity<Void> deleteProduct(
            Long id
    ) {

        if (!repository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        repository.deleteById(id);

        return ResponseEntity
                .noContent()
                .build();
    }

}