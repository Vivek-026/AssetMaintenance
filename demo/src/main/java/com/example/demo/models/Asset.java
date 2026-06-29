package com.example.demo.models;

import com.example.demo.enums.AssetStatus;
import com.example.demo.enums.AssetType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Random;

@Entity
@Table(name = "assets")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assetId;

    @Column(nullable = false, unique = true, updatable = false)
    private String assetCode;

    @Column(nullable = false)
    private String assetName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType assetType;

    @Column(nullable = false)
    private String location;

    private String manufacturer;

    private String model;

    @Column(unique = true)
    private String serialNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate purchaseDate;

    private LocalDate installationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status;

    @PrePersist
    private void generateAssetCode() {
        if (this.assetCode == null || this.assetCode.isEmpty()) {
            Random random = new Random();
            int numbers = 1000 + random.nextInt(9000);
            String letters = generateRandomLetters(random, 3);
            this.assetCode = "AST-" + numbers + "-" + letters;
        }
        if (this.status == null) {
            this.status = AssetStatus.ACTIVE;
        }
    }

    private String generateRandomLetters(Random random, int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            sb.append((char) ('A' + random.nextInt(26)));
        }
        return sb.toString();
    }
}
