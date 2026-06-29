package com.example.demo.service;

import com.example.demo.enums.UserRole;
import com.example.demo.models.MaintenanceTask;
import com.example.demo.models.User;
import com.example.demo.repository.TaskHistoryRepository;
import com.example.demo.repository.TaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository repo;

    @Mock
    private TaskHistoryRepository historyRepo;

    @Mock
    private UserService userService;

    @Mock
    private AssetService assetService;

    @InjectMocks
    private TaskService taskService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void searchMyReportedTasks_withKeyword_returnsOnlyCurrentUsersMatchingTasks() {
        User currentUser = User.builder()
                .userId(1L)
                .name("Vivek")
                .email("vivek@example.com")
                .role(UserRole.USER)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(currentUser, null, List.of())
        );

        MaintenanceTask task = MaintenanceTask.builder()
                .taskId(10L)
                .title("Press machine oil leak")
                .build();

        when(repo.searchTasksByReporter("press", 1L)).thenReturn(List.of(task));

        List<MaintenanceTask> result = taskService.searchMyReportedTasks("  press  ");

        assertEquals(1, result.size());
        assertEquals("Press machine oil leak", result.get(0).getTitle());
        verify(repo).searchTasksByReporter("press", 1L);
    }
}

