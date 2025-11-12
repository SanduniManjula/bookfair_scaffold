package com.example.bookfair.exception;

/**
 * Exception thrown when a bad request is made (validation errors, business rule violations)
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}

