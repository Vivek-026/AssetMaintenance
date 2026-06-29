package com.example.demo.service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.models.TaskHistory;
import com.example.demo.repository.TaskHistoryRepository;
import com.example.demo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskHistoryService {

    private final TaskHistoryRepository historyRepo;
    private final TaskRepository taskRepo;

    public List<TaskHistory> getHistoryByTaskId(Long taskId) {
        if (!taskRepo.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found with ID: " + taskId);
        }
        return historyRepo.findByTaskId(taskId);
    }
}

