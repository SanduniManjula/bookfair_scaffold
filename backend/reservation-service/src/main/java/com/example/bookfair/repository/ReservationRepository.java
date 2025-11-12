package com.example.bookfair.reservation.repository;

import com.example.bookfair.reservation.model.Reservation;
import com.example.bookfair.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUser(User user);
    
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
