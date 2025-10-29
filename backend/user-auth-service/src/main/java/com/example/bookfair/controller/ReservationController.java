// package com.example.bookfair.user.controller;

// import com.example.bookfair.user.model.*;
// import com.example.bookfair.user.repository.*;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;
// import java.util.*;

// @RestController
// @RequestMapping("/api/reservations")
// public class ReservationController {

//     @Autowired private StallRepoitory stallRepo;
//     @Autowired private ReservationRepository resRepo;
//     @Autowired private UserRepository userRepo;

//     @GetMapping("/available")
//     public List<Stall> availableStalls(){ return stallRepo.findByReservedFalse(); }

//     @PostMapping("/reserve")
//     public Map<String,Object> reserve(@RequestParam Long userId, @RequestParam Long stallId){
//         Optional<User> u = userRepo.findById(userId);
//         Optional<Stall> s = stallRepo.findById(stallId);
//         if(u.isEmpty() || s.isEmpty()) return Map.of("error","invalid");
//         long count = resRepo.countByUserId(userId);
//         if(count>=3) return Map.of("error","max 3 stalls allowed");
//         Stall stall = s.get();
//         if(stall.isReserved()) return Map.of("error","already reserved");
//         stall.setReserved(true);
//         stallRepo.save(stall);
//         Reservation r = new Reservation();
//         r.setUser(u.get());
//         r.setStall(stall);
//         // generate QR and send email hooks (to implement)
//         resRepo.save(r);
//         return Map.of("message","reserved","reservationId",r.getId());
//     }
// }
