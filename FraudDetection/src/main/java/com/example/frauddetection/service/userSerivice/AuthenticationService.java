package com.example.frauddetection.service.userSerivice;

import com.example.frauddetection.dtos.auth.AuthenticationRequest;
import com.example.frauddetection.dtos.auth.AuthenticationResponse;
import com.example.frauddetection.dtos.auth.RegisterRequest;
import com.example.frauddetection.config.JwtService;
import com.example.frauddetection.entity.user.Role;
import com.example.frauddetection.entity.user.User;
import com.example.frauddetection.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse registerCustomer(RegisterRequest request) {
        return register(request, Role.CUSTOMER);
    }

    // ⚠️ chỉ ADMIN mới gọi được API này
    public AuthenticationResponse registerAdmin(RegisterRequest request) {
        return register(request, Role.ADMIN);
    }

    private AuthenticationResponse register(RegisterRequest request, Role role) {

        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .age(request.getAge())
                .password(encoder.encode(request.getPassword()))
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(user);

        String jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}