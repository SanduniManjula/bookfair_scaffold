package com.example.bookfair.user.model;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name="reservations")
public class Reservation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private User user;
    @ManyToOne
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
