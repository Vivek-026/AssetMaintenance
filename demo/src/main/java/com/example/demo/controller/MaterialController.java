package com.example.demo.controller;

import com.example.demo.models.MaterialRequest;
import com.example.demo.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/material-requests")
public class MaterialController {

    private final MaterialService service;

    @PostMapping
    @PreAuthorize("hasRole('TECHNICIAN')")
    public MaterialRequest createMaterialRequest(@RequestParam Long taskId, @RequestBody MaterialRequest request) {
        return service.createMaterialRequest(taskId, request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<MaterialRequest> getAllMaterialRequests() {
        return service.getAllMaterialRequests();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'TECHNICIAN')")
    public MaterialRequest getMaterialRequestById(@PathVariable Long id) {
        return service.getMaterialRequestById(id);
    }

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'TECHNICIAN')")
    public List<MaterialRequest> getMaterialRequestsByTask(@PathVariable Long taskId) {
        return service.getMaterialRequestsByTask(taskId);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<MaterialRequest> getPendingRequests() {
        return service.getPendingRequests();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public MaterialRequest approveMaterialRequest(@PathVariable Long id, @RequestBody(required = false) String remarks) {
        return service.approveMaterialRequest(id, remarks);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public MaterialRequest rejectMaterialRequest(@PathVariable Long id, @RequestBody(required = false) String remarks) {
        return service.rejectMaterialRequest(id, remarks);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public List<MaterialRequest> getMyRequests() {
        return service.getRequestsCreatedByTechnician();
    }

    @GetMapping("/handled-by-me")
    @PreAuthorize("hasRole('MANAGER')")
    public List<MaterialRequest> getRequestsHandledByManager() {
        return service.getRequestByManagerId();
    }

    // Search material requests — role-based access:
    // MANAGER/ADMIN → all requests
    // TECHNICIAN    → only their own requests
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'TECHNICIAN')")
    public List<MaterialRequest> searchMaterialRequests(@RequestParam(required = false) String keyword) {
        return service.searchMaterialRequests(keyword);
    }
}