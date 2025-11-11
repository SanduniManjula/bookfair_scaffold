package com.example.bookfair.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for reservation request
 */
public class ReservationRequest {
    
    @NotNull(message = "Stall ID is required")
    private Long stallId;

    // Getters and Setters
    public Long getStallId() {
        return stallId;
    }

    public void setStallId(Long stallId) {
        this.stallId = stallId;
    }
}

