package com.example.bookfair.repository;
import com.example.bookfair.model.Stall;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StallRepository extends JpaRepository<Stall, Long> {
    List<Stall> findByReservedFalse();
}
