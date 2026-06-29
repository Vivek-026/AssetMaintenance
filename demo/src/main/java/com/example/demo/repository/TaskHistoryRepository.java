package com.example.demo.repository;

import com.example.demo.models.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {

    @Query("SELECT h FROM TaskHistory h WHERE h.task.taskId = :taskId ORDER BY h.changedAt ASC")
    List<TaskHistory> findByTaskId(Long taskId);
}
