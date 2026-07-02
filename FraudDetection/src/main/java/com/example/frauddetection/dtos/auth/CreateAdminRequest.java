package com.example.frauddetection.dtos.auth;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAdminRequest {
    private String email;
    private String password;
}
