package com.example.bookfair.repository;
import com.example.bookfair.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    long countByUserId(Long userId);
}
