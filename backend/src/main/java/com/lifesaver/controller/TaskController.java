package com.lifesaver.controller;

import com.lifesaver.dto.RescueModeDTO;
import com.lifesaver.dto.TaskRequestDTO;
import com.lifesaver.dto.TaskResponseDTO;
import com.lifesaver.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {

    @Autowired
    private TaskService taskService;

    private String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> getAllTasks() {
        String email = getAuthenticatedUserEmail();
        List<TaskResponseDTO> tasks = taskService.getAllTasks(email);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskRequestDTO dto) {
        String email = getAuthenticatedUserEmail();
        TaskResponseDTO task = taskService.createTask(dto, email);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/ai-extract")
    public ResponseEntity<List<TaskResponseDTO>> extractTasksFromAI(@RequestBody Map<String, String> body) {
        String email = getAuthenticatedUserEmail();
        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<TaskResponseDTO> tasks = taskService.extractTasksFromAI(text, email);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/schedule")
    public ResponseEntity<Map<String, String>> getDailySchedule() {
        String email = getAuthenticatedUserEmail();
        String schedule = taskService.getDailySchedule(email);
        Map<String, String> response = new HashMap<>();
        response.put("schedule", schedule);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rescue/{id}")
    public ResponseEntity<RescueModeDTO> getRescueMode(@PathVariable Long id) {
        RescueModeDTO rescueMode = taskService.getRescueMode(id);
        return ResponseEntity.ok(rescueMode);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDTO dto) {
        String email = getAuthenticatedUserEmail();
        TaskResponseDTO updatedTask = taskService.updateTask(id, dto, email);
        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TaskResponseDTO> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String email = getAuthenticatedUserEmail();
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        TaskResponseDTO updatedTask = taskService.updateTaskStatus(id, status, email);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        taskService.deleteTask(id, email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Task deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/briefing")
    public ResponseEntity<Map<String, String>> getMorningBriefing() {
        String email = getAuthenticatedUserEmail();
        String briefing = taskService.getMorningBriefing(email);
        Map<String, String> response = new HashMap<>();
        response.put("briefing", briefing);
        return ResponseEntity.ok(response);
    }
}
