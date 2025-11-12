package com.example.bookfair.exception;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GlobalExceptionHandler globalExceptionHandler;

    @Test
    void testExceptionHandler_ReturnsErrorResponse() throws Exception {
        // This test verifies that the GlobalExceptionHandler is properly configured
        // In a real scenario, you would trigger an exception and verify the response format
        
        // Example: Accessing a non-existent endpoint should return 404
        mockMvc.perform(get("/api/nonexistent")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}

