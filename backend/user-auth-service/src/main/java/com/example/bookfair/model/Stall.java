package com.example.bookfair.user.model;

import jakarta.persistence.*;

@Entity
@Table(name="stalls")
public class Stall {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String name; // alphabetic
    private String size; // SMALL,MEDIUM,LARGE
    private boolean reserved = false;
    // coordinates could be added for map visualization
    private int x;
    private int y;
    
    // Genres for this stall (comma-separated)
    @Column(length = 500)
    private String genres;

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

    public String getGenres() {
        return genres;
    }

    public void setGenres(String genres) {
        this.genres = genres;
    }
}
