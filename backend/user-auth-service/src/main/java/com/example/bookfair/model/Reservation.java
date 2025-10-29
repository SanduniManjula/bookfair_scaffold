package com.example.bookfair.user.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.*;

@Entity
@Getter
@Setter
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

}
