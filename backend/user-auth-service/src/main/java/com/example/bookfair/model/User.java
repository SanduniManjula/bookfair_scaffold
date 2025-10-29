package com.example.bookfair.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Map "username" field to "business_name" column in DB
    @Column(name = "business_name", nullable = false, length = 100)
    private String username;


    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    // Optional: user interests or genres
    @Column(length = 255)
    private String genres;

    // Default role
    @Column(nullable = false)
    private String role = "USER";

    // Optional: automatic timestamps
    private LocalDateTime createdAt = LocalDateTime.now();
}