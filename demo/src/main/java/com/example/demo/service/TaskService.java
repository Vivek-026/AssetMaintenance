package com.example.demo.service;

import com.example.demo.enums.TaskStatus;
import com.example.demo.enums.UserRole;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.models.Asset;
import com.example.demo.models.MaintenanceTask;
import com.example.demo.models.TaskHistory;
import com.example.demo.models.User;
import com.example.demo.repository.TaskHistoryRepository;
import com.example.demo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository repo;
    private final TaskHistoryRepository historyRepo;
    private final UserService userService;
    private final AssetService assetService;


    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    public MaintenanceTask createTask(MaintenanceTask task, Long assetId) {
        User reporter = getCurrentUser();
        Asset asset = assetService.getAssetById(assetId);
        task.setReportedBy(reporter);
        task.setAsset(asset);
        MaintenanceTask saved = repo.save(task);
        recordHistory(saved, null, TaskStatus.REPORTED, reporter, null);
        return saved;
    }

    public List<MaintenanceTask> getAllTasks() {
        return repo.findAll();
    }

    public List<MaintenanceTask> getTasksByTechnician() {
        User technician = getCurrentUser();
        return repo.findByAssignedToUserId(technician.getUserId());
    }

    public List<MaintenanceTask> getTasksReportedByUser() {
        User user = getCurrentUser();
        return repo.findByReportedByUserId(user.getUserId());
    }

    public MaintenanceTask getTaskById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));
    }

    public void assignTask(Long taskId, Long technicianId, String managerRemarks) {
        MaintenanceTask task = repo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User manager = getCurrentUser();

        User technician = userService.getUserById(technicianId);
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new IllegalArgumentException(
                    "User ID " + technicianId + " is not a TECHNICIAN (role: " + technician.getRole() + ")");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setManagerRemarks(managerRemarks);
        task.setAssignedTo(technician);
        task.setAssignedBy(manager);
        task.setStatus(TaskStatus.ASSIGNED);
        task.setAssignedAt(LocalDateTime.now());
        repo.save(task);

        recordHistory(task, oldStatus, TaskStatus.ASSIGNED, manager, managerRemarks);
    }

    public void startTask(Long taskId) {
        MaintenanceTask task = repo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User technician = getCurrentUser();

        if (task.getStatus() != TaskStatus.ASSIGNED) {
            throw new IllegalStateException("Task must be ASSIGNED before starting.");
        }

        if (!task.getAssignedTo().getUserId().equals(technician.getUserId())) {
            throw new IllegalStateException("Only the assigned technician can start this task.");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setStartedAt(LocalDateTime.now());
        repo.save(task);

        recordHistory(task, oldStatus, TaskStatus.IN_PROGRESS, technician, null);
    }

    public void markTaskCompleted(Long taskId, String technicianRemarks) {
        MaintenanceTask task = repo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User technician = getCurrentUser();

        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new IllegalStateException("Task must be IN_PROGRESS before marking completed.");
        }

        if (!task.getAssignedTo().getUserId().equals(technician.getUserId())) {
            throw new IllegalStateException("Only the assigned technician can complete this task.");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setTechnicianRemarks(technicianRemarks);
        task.setCompletedAt(LocalDateTime.now());
        task.setStatus(TaskStatus.COMPLETED_BY_TECHNICIAN);
        repo.save(task);

        recordHistory(task, oldStatus, TaskStatus.COMPLETED_BY_TECHNICIAN, technician, technicianRemarks);
    }

    public void confirmTaskCompleted(Long taskId, String managerRemarks) {
        MaintenanceTask task = repo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User manager = getCurrentUser();

        if (task.getStatus() != TaskStatus.COMPLETED_BY_TECHNICIAN) {
            throw new IllegalStateException("Task must be COMPLETED_BY_TECHNICIAN before manager can confirm.");
        }

        if (!task.getAssignedBy().getUserId().equals(manager.getUserId())) {
            throw new IllegalStateException("Only the manager who assigned the task can confirm its completion.");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setManagerRemarks(managerRemarks);
        task.setConfirmedAt(LocalDateTime.now());
        task.setStatus(TaskStatus.CONFIRMED_COMPLETED);
        repo.save(task);

        recordHistory(task, oldStatus, TaskStatus.CONFIRMED_COMPLETED, manager, managerRemarks);
    }

    public void rejectTask(Long taskId, String reason) {
        MaintenanceTask task = repo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User manager = getCurrentUser();

        TaskStatus currentStatus = task.getStatus();

        if (currentStatus != TaskStatus.REPORTED
                && currentStatus != TaskStatus.ASSIGNED
                && currentStatus != TaskStatus.COMPLETED_BY_TECHNICIAN) {
            throw new IllegalStateException("Task cannot be rejected in its current status: " + currentStatus);
        }

        if (task.getAssignedBy() != null && !task.getAssignedBy().getUserId().equals(manager.getUserId())) {
            throw new IllegalStateException("Only the manager who assigned the task can reject it.");
        }

        task.setManagerRemarks(reason);
        task.setStatus(TaskStatus.REJECTED);
        repo.save(task);

        recordHistory(task, currentStatus, TaskStatus.REJECTED, manager, reason);
    }


    public void reassignTask(Long taskId, Long technicianId, String managerRemarks) {
        MaintenanceTask task = repo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User manager = getCurrentUser();

        TaskStatus currentStatus = task.getStatus();

        if (currentStatus == TaskStatus.CONFIRMED_COMPLETED) {
            throw new IllegalStateException("Cannot reassign a task that is already CONFIRMED_COMPLETED.");
        }

        User technician = userService.getUserById(technicianId);
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new IllegalArgumentException(
                    "User ID " + technicianId + " is not a TECHNICIAN (role: " + technician.getRole() + ")");
        }


        task.setAssignedTo(technician);
        task.setAssignedBy(manager);
        task.setManagerRemarks(managerRemarks);
        task.setStatus(TaskStatus.ASSIGNED);
        task.setAssignedAt(LocalDateTime.now());


        task.setStartedAt(null);
        task.setCompletedAt(null);
        task.setConfirmedAt(null);
        task.setTechnicianRemarks(null);

        repo.save(task);

        recordHistory(task, currentStatus, TaskStatus.ASSIGNED, manager,
                "Reassigned to " + technician.getName() + ". Remarks: " + managerRemarks);
    }

    public List<MaintenanceTask> searchMyReportedTasks(String keyword) {
        User currentUser = getCurrentUser();

        if (keyword == null || keyword.trim().isEmpty()) {
            return repo.findByReportedByUserId(currentUser.getUserId());
        }

        return repo.searchTasksByReporter(keyword.trim(), currentUser.getUserId());
    }


    public List<MaintenanceTask> searchTasks(String keyword) {
        User currentUser = getCurrentUser();

        if (keyword == null || keyword.trim().isEmpty()) {
            if (currentUser.getRole() == UserRole.TECHNICIAN) {
                return repo.findByAssignedToUserId(currentUser.getUserId());
            } else if (currentUser.getRole() == UserRole.USER) {
                return repo.findByReportedByUserId(currentUser.getUserId());
            } else {
                return repo.findAll();
            }
        }

        String kw = keyword.trim();

        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            return repo.searchTasksByTechnician(kw, currentUser.getUserId());
        } else if (currentUser.getRole() == UserRole.USER) {
            return repo.searchTasksByReporter(kw, currentUser.getUserId());
        } else {
            return repo.searchAllTasks(kw);
        }
    }

    private void recordHistory(MaintenanceTask task, TaskStatus oldStatus,
                               TaskStatus newStatus, User changedBy, String remarks) {
        TaskHistory history = TaskHistory.builder()
                .task(task)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .remarks(remarks)
                .build();
        historyRepo.save(history);
    }
}
