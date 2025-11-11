package com.example.bookfair.service;

import com.example.bookfair.dto.ReservationCreateResponse;
import com.example.bookfair.dto.ReservationResponse;
import com.example.bookfair.dto.StallResponse;
import com.example.bookfair.exception.BadRequestException;
import com.example.bookfair.exception.ResourceNotFoundException;
import com.example.bookfair.user.model.Reservation;
import com.example.bookfair.user.model.Stall;
import com.example.bookfair.user.model.User;
import com.example.bookfair.user.repository.ReservationRepository;
import com.example.bookfair.user.repository.StallRepository;
import com.example.bookfair.user.repository.UserRepository;
import com.example.bookfair.util.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private StallRepository stallRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ReservationService reservationService;

    private User user;
    private Stall stall;
    private Reservation reservation;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setUsername("Test User");

        stall = new Stall();
        stall.setId(1L);
        stall.setName("Stall A1");
        stall.setSize("SMALL");
        stall.setReserved(false);
        stall.setX(100);
        stall.setY(200);

        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setUser(user);
        reservation.setStall(stall);
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setQrCodeFilename("qr_1.png");
    }

    @Test
    void testGetAvailableStalls_Success() {
        // Given
        List<Stall> stalls = Arrays.asList(stall);
        when(stallRepository.findByReservedFalse()).thenReturn(stalls);

        // When
        List<StallResponse> result = reservationService.getAvailableStalls();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Stall A1", result.get(0).getName());
        assertFalse(result.get(0).isReserved());
        verify(stallRepository).findByReservedFalse();
    }

    @Test
    void testCreateReservation_Success() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(reservationRepository.countByUserId(1L)).thenReturn(0L);
        when(stallRepository.findById(1L)).thenReturn(Optional.of(stall));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        // When
        ReservationCreateResponse response = reservationService.createReservation(1L, "test@example.com");

        // Then
        assertNotNull(response);
        assertEquals("Reservation confirmed successfully", response.getMessage());
        assertEquals(1L, response.getReservationId());
        assertEquals("Stall A1", response.getStallName());
        assertTrue(stall.isReserved());
        verify(userRepository).findByEmail("test@example.com");
        verify(reservationRepository).countByUserId(1L);
        verify(stallRepository).findById(1L);
        verify(stallRepository).save(stall);
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void testCreateReservation_MaxReservationsReached() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(reservationRepository.countByUserId(1L)).thenReturn(3L);

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            reservationService.createReservation(1L, "test@example.com");
        });

        verify(userRepository).findByEmail("test@example.com");
        verify(reservationRepository).countByUserId(1L);
        verify(stallRepository, never()).findById(anyLong());
    }

    @Test
    void testCreateReservation_StallAlreadyReserved() {
        // Given
        stall.setReserved(true);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(reservationRepository.countByUserId(1L)).thenReturn(0L);
        when(stallRepository.findById(1L)).thenReturn(Optional.of(stall));

        // When & Then
        assertThrows(BadRequestException.class, () -> {
            reservationService.createReservation(1L, "test@example.com");
        });

        verify(userRepository).findByEmail("test@example.com");
        verify(reservationRepository).countByUserId(1L);
        verify(stallRepository).findById(1L);
        verify(stallRepository, never()).save(any(Stall.class));
    }

    @Test
    void testCreateReservation_UserNotFound() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.createReservation(1L, "test@example.com");
        });

        verify(userRepository).findByEmail("test@example.com");
        verify(reservationRepository, never()).countByUserId(anyLong());
    }

    @Test
    void testGetUserReservations_Success() {
        // Given
        List<Reservation> reservations = Arrays.asList(reservation);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(reservationRepository.findByUser(user)).thenReturn(reservations);

        // When
        List<ReservationResponse> result = reservationService.getUserReservations("test@example.com");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals("Stall A1", result.get(0).getStallName());
        verify(userRepository).findByEmail("test@example.com");
        verify(reservationRepository).findByUser(user);
    }
}

