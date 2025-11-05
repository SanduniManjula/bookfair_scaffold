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
        if (stallRepository.count() == 0) {
            initializeStalls();
        }
    }

    private void initializeStalls() {
        // Create stalls alphabetically (A-Z) with different sizes
        String[] sizes = {"SMALL", "MEDIUM", "LARGE"};
        String[] letters = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
                           "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"};
        
        int x = 0, y = 0;
        int stallIndex = 0;
        
        for (String letter : letters) {
            String size = sizes[stallIndex % 3]; // Rotate sizes
            
            Stall stall = new Stall();
            stall.setName(letter);
            stall.setSize(size);
            stall.setReserved(false);
            stall.setX(x);
            stall.setY(y);
            
            stallRepository.save(stall);
            
            // Grid layout: 5 stalls per row
            x += 150;
            if ((stallIndex + 1) % 5 == 0) {
                x = 0;
                y += 100;
            }
            
            stallIndex++;
        }
        
        System.out.println("Initialized " + stallIndex + " stalls");
    }
}

