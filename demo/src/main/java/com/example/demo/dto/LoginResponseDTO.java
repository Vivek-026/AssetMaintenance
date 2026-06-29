package com.example.demo.dto;

import com.example.demo.enums.Department;
import com.example.demo.enums.UserRole;
import com.example.demo.models.User;
import lombok.Data;

@Data
public class LoginResponseDTO {

    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private Department department;
    private String token;

    public static LoginResponseDTO fromUser(User user, String token) {
        LoginResponseDTO dto = new LoginResponseDTO();
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setDepartment(user.getDepartment());
        dto.setToken(token);
        return dto;
    }
}

