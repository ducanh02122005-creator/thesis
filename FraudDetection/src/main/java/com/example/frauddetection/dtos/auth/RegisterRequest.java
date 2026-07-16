package com.example.frauddetection.dtos.auth;

import com.example.frauddetection.entity.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Xin hãy điền tên")
    @Size(min = 3)
    private String fullName;
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
    @NotBlank(message = "Password không được để trống")
    @Size(min = 3, max = 50,
            message = "Password phải từ 3 đến 50 ký tự")
    private String password;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotNull(message = "Tuổi không được để trống")
    @Min(value = 10, message = "Tuổi phải lớn hơn hoặc bằng 10")
    private Integer age;
}
