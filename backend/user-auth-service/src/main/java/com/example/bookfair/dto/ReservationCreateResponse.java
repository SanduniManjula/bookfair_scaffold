package com.example.bookfair.dto;

/**
 * DTO for reservation creation response
 */
public class ReservationCreateResponse {
    private String message;
    private Long reservationId;
    private String stallName;
    private String qrCodeFilename;

    public ReservationCreateResponse() {
    }

    public ReservationCreateResponse(String message, Long reservationId, String stallName, String qrCodeFilename) {
        this.message = message;
        this.reservationId = reservationId;
        this.stallName = stallName;
        this.qrCodeFilename = qrCodeFilename;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public String getStallName() {
        return stallName;
    }

    public void setStallName(String stallName) {
        this.stallName = stallName;
    }

    public String getQrCodeFilename() {
        return qrCodeFilename;
    }

    public void setQrCodeFilename(String qrCodeFilename) {
        this.qrCodeFilename = qrCodeFilename;
    }
}

