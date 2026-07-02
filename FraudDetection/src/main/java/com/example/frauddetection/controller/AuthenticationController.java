package com.example.frauddetection.controller;

import com.example.frauddetection.dtos.auth.AuthenticationRequest;
import com.example.frauddetection.dtos.auth.AuthenticationResponse;
import com.example.frauddetection.dtos.auth.RegisterRequest;
import com.example.frauddetection.entity.user.Role;
import com.example.frauddetection.service.userSerivice.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    // PUBLIC: chỉ tạo CUSTOMER
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> registerCustomer(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.registerCustomer(request));
    }

    // ADMIN ONLY: tạo admin account
    @PostMapping("/register/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthenticationResponse> registerAdmin(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.registerAdmin(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}