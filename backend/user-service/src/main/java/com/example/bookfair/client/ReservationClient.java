package com.example.bookfair.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "reservation-service", url = "${reservation.service.url:http://localhost:8082}")
public interface ReservationClient {
    
    @GetMapping("/api/admin/stats-internal")
    Map<String, Object> getReservationStats();
}
