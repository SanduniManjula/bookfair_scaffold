package com.example.bookfair.controller;

import com.example.bookfair.model.Employee;
import com.example.bookfair.repository.EmployeeRepository;
import com.example.bookfair.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return Map.of("error", "Email and password are required");
        }

        email = email.toLowerCase();
        Optional<Employee> employeeOpt = employeeRepository.findByEmail(email);

        if (employeeOpt.isEmpty() || !encoder.matches(password, employeeOpt.get().getPassword())) {
            return Map.of("error", "Invalid email or password");
        }

        Employee employee = employeeOpt.get();

        // Generate JWT token
        String token = jwtUtil.generateToken(employee.getEmail(), employee.getRole(), employee.getId());

        return Map.of(
                "message", "Login successful",
                "token", token,
                "employee", Map.of(
                        "id", employee.getId(),
                        "email", employee.getEmail(),
                        "role", employee.getRole()
                )
        );
    }
}

