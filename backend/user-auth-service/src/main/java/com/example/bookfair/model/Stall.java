package com.example.bookfair.user.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
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

}
