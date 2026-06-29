package com.example.demo.models;

import com.example.demo.enums.TaskPriority;
import com.example.demo.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Random;

@Entity
@Table(name = "maintenance_tasks")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MaintenanceTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;

    @Column(unique = true, nullable = false, updatable = false)
    private String taskCode;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id")
    private Asset asset;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by_id")
    private User assignedBy;

    @Column(columnDefinition = "TEXT")
    private String managerRemarks;

    @Column(columnDefinition = "TEXT")
    private String technicianRemarks;

    // Auto-set when task is first saved
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime reportedAt;

    private LocalDateTime assignedAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private LocalDateTime confirmedAt;


    @PrePersist
    private void prePersist() {
        // Auto-generate task code
        if (this.taskCode == null || this.taskCode.isEmpty()) {
            Random random = new Random();
            int numbers = 1000 + random.nextInt(9000);
            String letters = generateRandomLetters(random, 3);
            this.taskCode = "TSK-" + numbers + "-" + letters;
        }
        // Default status when first created
        if (this.status == null) {
            this.status = TaskStatus.REPORTED;
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
