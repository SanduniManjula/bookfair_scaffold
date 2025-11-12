package com.example.bookfair.service;

import com.example.bookfair.client.EmailClient;
import com.example.bookfair.client.UserClient;
import com.example.bookfair.dto.*;
import com.example.bookfair.exception.BadRequestException;
import com.example.bookfair.exception.ResourceNotFoundException;
import com.example.bookfair.model.Reservation;
import com.example.bookfair.model.Stall;
import com.example.bookfair.repository.ReservationRepository;
import com.example.bookfair.repository.StallRepository;
import com.example.bookfair.util.QrUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for reservation business logic
 */
@Service
public class ReservationService {

    private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private UserClient userClient;

    @Autowired
    private EmailClient emailClient;

    @Value("${qr.code.directory:./qr-codes}")
    private String qrDirectory;

    private static final int MAX_RESERVATIONS_PER_USER = 3;

    /**
     * Get all available stalls
     */
    public List<StallResponse> getAvailableStalls() {
        List<Stall> stalls = stallRepository.findByReservedFalse();
        return stalls.stream()
                .map(this::toStallResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all stalls
     */
    public List<StallResponse> getAllStalls() {
        return stallRepository.findAll().stream()
                .sorted((a, b) -> Long.compare(a.getId(), b.getId()))
                .map(this::toStallResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a reservation for a user
     */
    @Transactional
    public ReservationCreateResponse createReservation(Long stallId, String userEmail) {
        // Fetch user from user-service via Feign client
        UserResponse user;
        try {
            user = userClient.getUserByEmail(userEmail);
            if (user == null) {
                throw new ResourceNotFoundException("User not found");
            }
        } catch (Exception e) {
            logger.error("Failed to fetch user from user-service: {}", e.getMessage());
            throw new ResourceNotFoundException("User not found: " + e.getMessage());
        }

        Long userId = user.getId();

        // Check if user already has maximum reservations
        long count = reservationRepository.countByUserId(userId);
        if (count >= MAX_RESERVATIONS_PER_USER) {
            throw new BadRequestException("Maximum " + MAX_RESERVATIONS_PER_USER + " stalls allowed per user");
        }

        Stall stall = stallRepository.findById(stallId)
                .orElseThrow(() -> new ResourceNotFoundException("Stall not found"));

        if (stall.isReserved()) {
            throw new BadRequestException("Stall already reserved");
        }

        // Reserve the stall
        stall.setReserved(true);
        stallRepository.save(stall);

        // Create reservation
        Reservation reservation = new Reservation();
        reservation.setUserId(userId);
        reservation.setUserEmail(userEmail);
        reservation.setStall(stall);
        reservation = reservationRepository.save(reservation);

        // Send reservation request email (non-blocking)
        try {
            Map<String, Object> emailRequest = new HashMap<>();
            emailRequest.put("email", user.getEmail());
            emailRequest.put("username", user.getUsername());
            emailRequest.put("stallName", stall.getName());
            emailRequest.put("stallSize", stall.getSize());
            emailRequest.put("reservationId", reservation.getId());
            emailRequest.put("createdAt", reservation.getCreatedAt().toString());
            emailClient.sendReservationRequestEmail(emailRequest);
        } catch (Exception e) {
            logger.warn("Failed to send reservation request email: {}", e.getMessage());
        }

        // Generate QR code
        String qrFilename = generateQrCode(reservation, stallId, userEmail);

        // Send confirmation email with QR code (non-blocking)
        try {
            Path qrPath = Paths.get(qrDirectory).resolve(qrFilename);
            String absoluteQrPath = qrPath.toAbsolutePath().toString();
            
            Map<String, Object> emailRequest = new HashMap<>();
            emailRequest.put("email", user.getEmail());
            emailRequest.put("username", user.getUsername());
            emailRequest.put("stallName", stall.getName());
            emailRequest.put("stallSize", stall.getSize());
            emailRequest.put("reservationId", reservation.getId());
            emailRequest.put("createdAt", reservation.getCreatedAt().toString());
            emailRequest.put("qrCodePath", absoluteQrPath);
            emailClient.sendReservationConfirmation(emailRequest);
        } catch (Exception e) {
            logger.warn("Failed to send confirmation email: {}", e.getMessage());
        }

        return new ReservationCreateResponse(
                "Reservation confirmed successfully",
                reservation.getId(),
                stall.getName(),
                qrFilename
        );
    }

    /**
     * Get user's reservations
     */
    public List<ReservationResponse> getUserReservations(String userEmail) {
        List<Reservation> reservations = reservationRepository.findByUserEmail(userEmail);
        return reservations.stream()
                .map(this::toReservationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Generate QR code for reservation
     */
    private String generateQrCode(Reservation reservation, Long stallId, String userEmail) {
        try {
            String qrText = String.format("Bookfair-%d-%d-%s", reservation.getId(), stallId, userEmail);
            Path qrDir = Paths.get(qrDirectory);
            if (!Files.exists(qrDir)) {
                Files.createDirectories(qrDir);
            }
            String qrFilename = "qr_" + reservation.getId() + ".png";
            Path qrPath = qrDir.resolve(qrFilename);
            QrUtil.generateQRCodeImage(qrText, qrPath.toString());
            reservation.setQrCodeFilename(qrFilename);
            reservationRepository.save(reservation);
            return qrFilename;
        } catch (Exception e) {
            logger.error("Failed to generate QR code for reservation {}: {}", reservation.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Save stall genres
     */
    @Transactional
    public void saveStallGenres(List<Map<String, Object>> stallGenresList, String userEmail) {
        // Verify user owns the stalls by checking reservations
        for (Map<String, Object> stallGenreData : stallGenresList) {
            Object stallIdObj = stallGenreData.get("stallId");
            String genresStr = (String) stallGenreData.get("genres");
            
            if (stallIdObj == null || genresStr == null) {
                continue;
            }
            
            Long stallId;
            if (stallIdObj instanceof Integer) {
                stallId = ((Integer) stallIdObj).longValue();
            } else if (stallIdObj instanceof Long) {
                stallId = (Long) stallIdObj;
            } else {
                continue;
            }
            
            // Verify user has a reservation for this stall
            boolean hasReservation = reservationRepository.findByUserEmail(userEmail).stream()
                    .anyMatch(r -> r.getStall().getId().equals(stallId));
            
            if (!hasReservation) {
                throw new BadRequestException("You don't have a reservation for stall " + stallId);
            }
            
            // Update stall genres
            Stall stall = stallRepository.findById(stallId)
                    .orElseThrow(() -> new ResourceNotFoundException("Stall not found"));
            stall.setGenres(genresStr);
            stallRepository.save(stall);
        }
        
        logger.info("Updated genres for {} stalls for user: {}", stallGenresList.size(), userEmail);
    }

    /**
     * Convert Stall entity to StallResponse DTO
     */
    private StallResponse toStallResponse(Stall stall) {
        return new StallResponse(
                stall.getId(),
                stall.getName(),
                stall.getSize(),
                stall.isReserved(),
                stall.getX(),
                stall.getY(),
                stall.getGenres() != null ? stall.getGenres() : ""
        );
    }

    /**
     * Convert Reservation entity to ReservationResponse DTO
     */
    private ReservationResponse toReservationResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getStall().getId(),
                reservation.getStall().getName(),
                reservation.getStall().getSize(),
                reservation.getStall().getGenres() != null ? reservation.getStall().getGenres() : "",
                reservation.getCreatedAt(),
                reservation.getQrCodeFilename()
        );
    }
}

