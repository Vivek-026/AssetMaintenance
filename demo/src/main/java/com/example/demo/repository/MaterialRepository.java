package com.example.demo.repository;

import com.example.demo.enums.MaterialRequestStatus;
import com.example.demo.models.MaterialRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<MaterialRequest, Long> {

    @Query("SELECT m FROM MaterialRequest m WHERE m.task.taskId = :taskId")
    List<MaterialRequest> findByTaskId(Long taskId);

    List<MaterialRequest> findByStatus(MaterialRequestStatus status);

    @Query("SELECT m FROM MaterialRequest m WHERE m.requestedBy.userId = :userId")
    List<MaterialRequest> findByRequestedByUserId(Long userId);

    List<MaterialRequest> findByApprovedByUserId(Long managerId);

    @Query("SELECT m FROM MaterialRequest m " +
           "LEFT JOIN m.task t " +
           "LEFT JOIN m.requestedBy rb " +
           "LEFT JOIN m.approvedBy ab " +
           "WHERE LOWER(m.materialName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.reason) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(m.status AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.taskCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rb.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ab.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MaterialRequest> searchAllMaterialRequests(@Param("keyword") String keyword);

    @Query("SELECT m FROM MaterialRequest m " +
           "LEFT JOIN m.task t " +
           "LEFT JOIN m.requestedBy rb " +
           "LEFT JOIN m.approvedBy ab " +
           "WHERE m.requestedBy.userId = :userId AND (" +
           "LOWER(m.materialName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.reason) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(m.status AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.taskCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rb.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ab.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<MaterialRequest> searchMaterialRequestsByTechnician(@Param("keyword") String keyword, @Param("userId") Long userId);
}
