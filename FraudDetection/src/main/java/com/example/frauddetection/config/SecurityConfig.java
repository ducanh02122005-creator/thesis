package com.example.frauddetection.config;

import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth
// 1. Cấu hình quyền ADMIN trước (Từ cụ thể nhất...)
                                .requestMatchers("/api/v1/auth/admin/**").permitAll()
//                                .requestMatchers("/api/v1/auth/admin/**").hasRole("ADMIN")

                                // 2. Cấu hình các API mở không cần Token (Đăng nhập, Đăng ký)
                                .requestMatchers("/api/v1/auth/**").permitAll()

                                // Nếu API login của bạn là /user/login (như file Controller gửi lúc trước), hãy mở thêm dòng này:
                                .requestMatchers("/user/login").permitAll()

                                .requestMatchers("/api/v1/dashboard/**").hasRole("ADMIN")
                                // 3. CHUYỂN XUỐNG CUỐI CÙNG: Tất cả các request còn lại đều phải Authenticate
                                .anyRequest().authenticated()
                )

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authenticationProvider(authenticationProvider)

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
