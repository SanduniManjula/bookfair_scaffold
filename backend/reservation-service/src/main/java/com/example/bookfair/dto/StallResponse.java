package com.example.bookfair.dto;

/**
 * DTO for stall information in API responses
 */
public class StallResponse {
    private Long id;
    private String name;
    private String size;
    private boolean reserved;
    private int x;
    private int y;

    public StallResponse() {
    }

    public StallResponse(Long id, String name, String size, boolean reserved, int x, int y) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.reserved = reserved;
        this.x = x;
        this.y = y;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public boolean isReserved() {
        return reserved;
    }

    public void setReserved(boolean reserved) {
        this.reserved = reserved;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }
}

