package com.example.bookfair.service;

import com.example.bookfair.dto.LoginRequest;
import com.example.bookfair.dto.LoginResponse;
import com.example.bookfair.dto.UserRegistrationRequest;
import com.example.bookfair.exception.BadRequestException;
import com.example.bookfair.user.model.User;
import com.example.bookfair.user.repository.UserRepository;
import com.example.bookfair.security.JwtUtil;
import com.example.bookfair.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder encoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private UserRegistrationRequest registrationRequest;
    private User user;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registrationRequest = new UserRegistrationRequest();
        registrationRequest.setUsername("Test User");
        registrationRequest.setEmail("test@example.com");
        registrationRequest.setPassword("password123");
        registrationRequest.setGenres("Fiction, Science");

        user = new User();
        user.setId(1L);
        user.setUsername("Test User");
        user.setEmail("test@example.com");
        user.setPassword("$2a$10$encodedPassword");
        user.setGenres("Fiction, Science");
        user.setRole("USER");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void testRegister_Success() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(encoder.encode(anyString())).thenReturn("$2a$10$encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        Map<String, Object> result = authService.register(registrationRequest);

        // Then
        assertNotNull(result);
        assertEquals("Registered successfully", result.get("message"));
        verify(userRepository).findByEmail("test@example.com");
        verify(encoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(emailService, times(1)).sendWelcomeEmail(any(User.class));
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            authService.register(registrationRequest);
        });

        verify(userRepository).findByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("password123", user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString(), anyLong())).thenReturn("jwt-token");

        // When
        LoginResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("Login successful", response.getMessage());
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getUser());
        assertEquals("test@example.com", response.getUser().getEmail());
        verify(userRepository).findByEmail("test@example.com");
        verify(encoder).matches("password123", user.getPassword());
        verify(jwtUtil).generateToken("test@example.com", "USER", 1L);
    }

    @Test
    void testLogin_InvalidEmail() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest);
        });

        verify(userRepository).findByEmail("test@example.com");
        verify(jwtUtil, never()).generateToken(anyString(), anyString(), anyLong());
    }

    @Test
    void testLogin_InvalidPassword() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("wrongpassword", user.getPassword())).thenReturn(false);

        loginRequest.setPassword("wrongpassword");

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest);
        });

        verify(userRepository).findByEmail("test@example.com");
        verify(encoder).matches("wrongpassword", user.getPassword());
        verify(jwtUtil, never()).generateToken(anyString(), anyString(), anyLong());
    }
}

