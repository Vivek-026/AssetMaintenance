package com.example.demo.repository;

import com.example.demo.models.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<MaintenanceTask, Long> {

    List<MaintenanceTask> findByAssignedToUserId(Long technicianId);

    List<MaintenanceTask> findByReportedByUserId(Long userId);

    // Search all tasks — for MANAGER and ADMIN
    @Query("SELECT t FROM MaintenanceTask t " +
           "LEFT JOIN t.asset a " +
           "LEFT JOIN t.assignedTo at " +
           "LEFT JOIN t.reportedBy rb " +
           "WHERE LOWER(t.taskCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(t.priority AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(t.status AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.assetName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.assetCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rb.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(at.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MaintenanceTask> searchAllTasks(@Param("keyword") String keyword);

    // Search only tasks reported by a specific user — for USER role
    @Query("SELECT t FROM MaintenanceTask t " +
           "LEFT JOIN t.asset a " +
           "LEFT JOIN t.assignedTo at " +
           "LEFT JOIN t.reportedBy rb " +
           "WHERE t.reportedBy.userId = :userId AND (" +
           "LOWER(t.taskCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(t.priority AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(t.status AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.assetName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.assetCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rb.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(at.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<MaintenanceTask> searchTasksByReporter(@Param("keyword") String keyword, @Param("userId") Long userId);

    // Search only tasks assigned to a specific technician — for TECHNICIAN role
    @Query("SELECT t FROM MaintenanceTask t " +
           "LEFT JOIN t.asset a " +
           "LEFT JOIN t.assignedTo at " +
           "LEFT JOIN t.reportedBy rb " +
           "WHERE t.assignedTo.userId = :technicianId AND (" +
           "LOWER(t.taskCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(t.priority AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(t.status AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.assetName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.assetCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rb.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(at.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<MaintenanceTask> searchTasksByTechnician(@Param("keyword") String keyword, @Param("technicianId") Long technicianId);
}
