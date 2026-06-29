package com.example.demo.controller;

import com.example.demo.models.MaintenanceTask;
import com.example.demo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'TECHNICIAN', 'ADMIN')")
    public MaintenanceTask createTask(@RequestBody MaintenanceTask task, @RequestParam Long assetId) {
        return service.createTask(task, assetId);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<MaintenanceTask> getAllTasks() {
        return service.getAllTasks();
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public List<MaintenanceTask> getMyTasks() {
        return service.getTasksByTechnician();
    }

    @GetMapping("/my-reported")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'TECHNICIAN', 'ADMIN')")
    public List<MaintenanceTask> getMyReportedTasks() {
        return service.getTasksReportedByUser();
    }

    @GetMapping("/my-reported/search")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'TECHNICIAN', 'ADMIN')")
    public List<MaintenanceTask> searchMyReportedTasks(@RequestParam(required = false) String keyword) {
        return service.searchMyReportedTasks(keyword);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'TECHNICIAN', 'ADMIN')")
    public MaintenanceTask getTaskById(@PathVariable Long id) {
        return service.getTaskById(id);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('MANAGER')")
    public void assignTask(@PathVariable Long id, @RequestParam Long technicianId,
                           @RequestBody(required = false) String managerRemarks) {
        service.assignTask(id, technicianId, managerRemarks);
    }

    @PutMapping("/{id}/start")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public void startTask(@PathVariable Long id) {
        service.startTask(id);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public void markTaskCompleted(@PathVariable Long id, @RequestBody(required = false) String technicianRemarks) {
        service.markTaskCompleted(id, technicianRemarks);
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('MANAGER')")
    public void confirmTaskCompleted(@PathVariable Long id, @RequestBody(required = false) String managerRemarks) {
        service.confirmTaskCompleted(id, managerRemarks);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public void rejectTask(@PathVariable Long id, @RequestBody(required = false) String reason) {
        service.rejectTask(id, reason);
    }


    @PutMapping("/{id}/reassign")
    @PreAuthorize("hasRole('MANAGER')")
    public void reassignTask(@PathVariable Long id,
                             @RequestParam Long technicianId,
                             @RequestBody(required = false) String managerRemarks) {
        service.reassignTask(id, technicianId, managerRemarks);
    }


    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'TECHNICIAN', 'ADMIN')")
    public List<MaintenanceTask> searchTasks(@RequestParam(required = false) String keyword) {
        return service.searchTasks(keyword);
    }
}
