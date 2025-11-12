package com.example.bookfair.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="reservations")
public class Reservation {
    @Id 
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    
    // Store userId only - no JPA relationship across microservices
    // User details will be fetched via REST API from user-service
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    // Store user email for quick reference (denormalized for performance)
    @Column(name = "user_email", nullable = false)
    private String userEmail;
    
    // Stall relationship - within same service, so @ManyToOne is fine
    @ManyToOne
    @JoinColumn(name = "stall_id", nullable = false)
    private Stall stall;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private String qrCodeFilename;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Stall getStall() {
        return stall;
    }

    public void setStall(Stall stall) {
        this.stall = stall;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getQrCodeFilename() {
        return qrCodeFilename;
    }

    public void setQrCodeFilename(String qrCodeFilename) {
        this.qrCodeFilename = qrCodeFilename;
    }
}

