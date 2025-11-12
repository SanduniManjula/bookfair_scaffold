package com.example.bookfair.stallservice.controller;

import com.example.bookfair.stallservice.model.Stall;
import com.example.bookfair.stallservice.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/stalls")
@CrossOrigin(origins = "http://localhost:3000")
public class StallController {

    @Autowired
    private StallRepository stallRepository;


    @GetMapping
    public ResponseEntity<?> getAllStalls() {
        List<Stall> stalls = stallRepository.findAll();

        List<Map<String, Object>> stallList = new ArrayList<>();
        for (Stall stall : stalls) {
            Map<String, Object> stallMap = new HashMap<>();
            stallMap.put("id", stall.getId());
            stallMap.put("name", stall.getName());
            stallMap.put("size", stall.getSize());
            stallMap.put("x", stall.getX());
            stallMap.put("y", stall.getY());
            stallMap.put("reserved", stall.isReserved());
            stallList.add(stallMap);
        }

        return ResponseEntity.ok(Map.of(
                "stalls", stallList,
                "total", stallList.size()
        ));
    }

    @GetMapping("/{stallId}")
    public ResponseEntity<?> getStallById(@PathVariable Long stallId) {
        Optional<Stall> stallOpt = stallRepository.findById(stallId);
        if (stallOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Stall not found"));
        }
        return ResponseEntity.ok(stallOpt.get());
    }


    @PostMapping
    public ResponseEntity<?> createStall(@RequestBody Stall stall, Authentication authentication) {
        // Optional: Add admin check here if needed
        if (stall.getName() == null || stall.getName().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Stall name is required"));
        }


        if (stall.getSize() == null) stall.setSize("SMALL");
        if (stall.getX() == 0) stall.setX(0);
        if (stall.getY() == 0) stall.setY(0);
        stall.setReserved(false);

        Stall saved = stallRepository.save(stall);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Stall created successfully", "stall", saved));
    }


    @PutMapping("/{stallId}")
    public ResponseEntity<?> updateStall(@PathVariable Long stallId, @RequestBody Map<String, Object> updates) {
        Optional<Stall> stallOpt = stallRepository.findById(stallId);
        if (stallOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Stall not found"));
        }

        Stall stall = stallOpt.get();

        if (updates.containsKey("name")) stall.setName((String) updates.get("name"));
        if (updates.containsKey("size")) stall.setSize(((String) updates.get("size")).toUpperCase());
        if (updates.containsKey("x")) stall.setX((Integer) updates.get("x"));
        if (updates.containsKey("y")) stall.setY((Integer) updates.get("y"));
        if (updates.containsKey("reserved")) stall.setReserved((Boolean) updates.get("reserved"));

        Stall updated = stallRepository.save(stall);
        return ResponseEntity.ok(Map.of("message", "Stall updated successfully", "stall", updated));
    }


    @DeleteMapping("/{stallId}")
    public ResponseEntity<?> deleteStall(@PathVariable Long stallId) {
        Optional<Stall> stallOpt = stallRepository.findById(stallId);
        if (stallOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Stall not found"));
        }

        stallRepository.deleteById(stallId);
        return ResponseEntity.ok(Map.of("message", "Stall deleted successfully"));
    }


    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAllStalls() {
        long count = stallRepository.count();
        stallRepository.deleteAll();
        return ResponseEntity.ok(Map.of(
                "message", "All stalls deleted successfully",
                "deletedCount", count
        ));
    }


    @GetMapping("/available")
    public ResponseEntity<?> getAvailableStalls() {
        List<Stall> available = stallRepository.findAll()
                .stream()
                .filter(stall -> !stall.isReserved())
                .toList();

        return ResponseEntity.ok(Map.of(
                "availableStalls", available,
                "total", available.size()
        ));
    }
}
