package com.example.bookfair.config;

import com.example.bookfair.user.model.Stall;
import com.example.bookfair.user.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class StallDataInitializer implements CommandLineRunner {

    @Autowired
    private StallRepository stallRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (stallRepository.count() == 0) {
            initializeStalls();
        } else if (stallRepository.count() < 436) {
            // If we have fewer than 436 stalls, add the missing ones
            addMissingStalls();
        }
    }

    private void initializeStalls() {
        String[] sizes = {"SMALL", "MEDIUM", "LARGE"};
        int totalStalls = 436;
        
        // Create all 436 stalls with sequential naming
        for (int i = 0; i < totalStalls; i++) {
            String size = sizes[i % 3]; // Rotate sizes
            String name = generateStallName(i);
            
            // Calculate approximate coordinates based on index
            // This is a simple distribution - in production, you'd use actual polygon coordinates
            int x = 100 + (i * 50) % 2500;
            int y = 100 + (i * 60) % 2800;
            
            Stall stall = new Stall();
            stall.setName(name);
            stall.setSize(size);
            stall.setReserved(false);
            stall.setX(x);
            stall.setY(y);
            
            stallRepository.save(stall);
        }
        
        System.out.println("Initialized " + totalStalls + " stalls");
    }

    private void addMissingStalls() {
        long existingCount = stallRepository.count();
        int totalStalls = 436;
        int missingCount = totalStalls - (int)existingCount;
        
        if (missingCount <= 0) return;
        
        String[] sizes = {"SMALL", "MEDIUM", "LARGE"};
        
        // Generate coordinates for missing stalls (approximate positions)
        int startIndex = (int)existingCount;
        for (int i = 0; i < missingCount; i++) {
            int stallIndex = startIndex + i;
            String size = sizes[stallIndex % 3];
            String name = generateStallName(stallIndex);
            
            // Calculate approximate position based on index
            int x = 100 + (stallIndex * 10) % 2500;
            int y = 100 + (stallIndex * 15) % 2800;
            
            Stall stall = new Stall();
            stall.setName(name);
            stall.setSize(size);
            stall.setReserved(false);
            stall.setX(x);
            stall.setY(y);
            
            stallRepository.save(stall);
        }
        
        System.out.println("Added " + missingCount + " missing stalls");
    }

    private String generateStallName(int index) {
        // Generate names: A-Z (0-25), AA-AZ (26-51), BA-BZ (52-77), etc.
        if (index < 26) {
            return String.valueOf((char)('A' + index));
        } else {
            int firstLetterIndex = (index - 26) / 26;
            int secondLetterIndex = (index - 26) % 26;
            if (firstLetterIndex < 26) {
                char firstLetter = (char)('A' + firstLetterIndex);
                char secondLetter = (char)('A' + secondLetterIndex);
                return String.valueOf(firstLetter) + String.valueOf(secondLetter);
            } else {
                // For indices > 26*26+26, use S1, S2, etc.
                return "S" + (index + 1);
            }
        }
    }
}
