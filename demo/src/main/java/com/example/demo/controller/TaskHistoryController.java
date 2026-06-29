package com.example.demo.controller;

import com.example.demo.models.TaskHistory;
import com.example.demo.service.TaskHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tasks")
public class TaskHistoryController {

    private final TaskHistoryService service;

    @GetMapping("/{taskId}/history")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<TaskHistory> getTaskHistory(@PathVariable Long taskId) {
        return service.getHistoryByTaskId(taskId);
    }
}

