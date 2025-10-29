package com.example.bookfair.user.repository;
import com.example.bookfair.user.model.Stall;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StallRepository extends JpaRepository<Stall, Long> {
    List<Stall> findByReservedFalse();
}
