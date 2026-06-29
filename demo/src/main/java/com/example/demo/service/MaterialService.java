package com.example.demo.service;

import com.example.demo.enums.MaterialRequestStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.models.MaintenanceTask;
import com.example.demo.models.MaterialRequest;
import com.example.demo.models.User;
import com.example.demo.repository.MaterialRepository;
import com.example.demo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository repo;
    private final TaskRepository taskRepo;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    // Technician requests material for an assigned task
    public MaterialRequest createMaterialRequest(Long taskId, MaterialRequest request) {
        User technician = getCurrentUser();

        MaintenanceTask task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // Only the assigned technician can request material
        if (!task.getAssignedTo().getUserId().equals(technician.getUserId())) {
            throw new IllegalStateException("Only the assigned technician can request material for this task.");
        }

        request.setTask(task);
        request.setRequestedBy(technician);
        return repo.save(request);
    }

    // Manager/Admin — view all material requests
    public List<MaterialRequest> getAllMaterialRequests() {
        return repo.findAll();
    }

    // View one request by ID
    public MaterialRequest getMaterialRequestById(Long requestId) {
        return repo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Material request not found with ID: " + requestId));
    }

    // View material requests of one task
    public List<MaterialRequest> getMaterialRequestsByTask(Long taskId) {
        if (!taskRepo.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found with ID: " + taskId);
        }
        return repo.findByTaskId(taskId);
    }

    public List<MaterialRequest> getPendingRequests() {
        return repo.findByStatus(MaterialRequestStatus.PENDING);
    }

    public MaterialRequest approveMaterialRequest(Long requestId, String remarks) {
        MaterialRequest request = getMaterialRequestById(requestId);
        User manager = getCurrentUser();

        if (request.getStatus() != MaterialRequestStatus.PENDING) {
            throw new IllegalStateException("Only PENDING requests can be approved.");
        }

        request.setStatus(MaterialRequestStatus.APPROVED);
        request.setApprovedBy(manager);
        request.setApprovedAt(LocalDateTime.now());
        request.setManagerRemarks(remarks);
        return repo.save(request);
    }

    public MaterialRequest rejectMaterialRequest(Long requestId, String remarks) {
        MaterialRequest request = getMaterialRequestById(requestId);
        User manager = getCurrentUser();

        if (request.getStatus() != MaterialRequestStatus.PENDING) {
            throw new IllegalStateException("Only PENDING requests can be rejected.");
        }

        request.setStatus(MaterialRequestStatus.REJECTED);
        request.setApprovedBy(manager);
        request.setApprovedAt(LocalDateTime.now());
        request.setManagerRemarks(remarks);
        return repo.save(request);
    }

    public List<MaterialRequest> getRequestsCreatedByTechnician() {
        User technician = getCurrentUser();
        return repo.findByRequestedByUserId(technician.getUserId());
    }

    public List<MaterialRequest> getRequestByManagerId(){
        User manager = getCurrentUser();
        return repo.findByApprovedByUserId(manager.getUserId());
    }

    // Search material requests — role-aware:
    // MANAGER/ADMIN → search all requests
    // TECHNICIAN    → only their own requests
    public List<MaterialRequest> searchMaterialRequests(String keyword) {
        User currentUser = getCurrentUser();

        // Empty keyword → return normal list based on role
        if (keyword == null || keyword.trim().isEmpty()) {
            if (currentUser.getRole() == com.example.demo.enums.UserRole.TECHNICIAN) {
                return repo.findByRequestedByUserId(currentUser.getUserId());
            } else {
                return repo.findAll(); // MANAGER, ADMIN
            }
        }

        String kw = keyword.trim();

        if (currentUser.getRole() == com.example.demo.enums.UserRole.TECHNICIAN) {
            return repo.searchMaterialRequestsByTechnician(kw, currentUser.getUserId());
        } else {
            return repo.searchAllMaterialRequests(kw); // MANAGER, ADMIN
        }
    }
}