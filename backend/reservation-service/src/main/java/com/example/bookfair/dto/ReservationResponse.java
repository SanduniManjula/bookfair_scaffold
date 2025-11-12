package com.example.bookfair.dto;

import java.time.LocalDateTime;

/**
 * DTO for reservation information in API responses
 */
public class ReservationResponse {
    private Long id;
    private Long stallId;
    private String stallName;
    private String stallSize;
    private LocalDateTime createdAt;
    private String qrCodeFilename;

    public ReservationResponse() {
    }

    public ReservationResponse(Long id, Long stallId, String stallName, String stallSize, 
                               LocalDateTime createdAt, String qrCodeFilename) {
        this.id = id;
        this.stallId = stallId;
        this.stallName = stallName;
        this.stallSize = stallSize;
        this.createdAt = createdAt;
        this.qrCodeFilename = qrCodeFilename;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStallId() {
        return stallId;
    }

    public void setStallId(Long stallId) {
        this.stallId = stallId;
    }

    public String getStallName() {
        return stallName;
    }

    public void setStallName(String stallName) {
        this.stallName = stallName;
    }

    public String getStallSize() {
        return stallSize;
    }

    public void setStallSize(String stallSize) {
        this.stallSize = stallSize;
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

