package com.example.bookfair.user.repository;
import com.example.bookfair.user.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    long countByUserId(Long userId);
}
