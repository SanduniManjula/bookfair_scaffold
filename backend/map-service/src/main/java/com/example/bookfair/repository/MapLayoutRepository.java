package com.example.bookfair.mapservice.repository;
import com.example.bookfair.mapservice.model.MapLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MapLayoutRepository extends JpaRepository<MapLayout, Long> {
    // Get the latest map layout
    Optional<MapLayout> findTopByOrderByIdDesc();
}

