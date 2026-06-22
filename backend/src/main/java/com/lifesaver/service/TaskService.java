package com.lifesaver.service;

import com.lifesaver.dto.RescueModeDTO;
import com.lifesaver.dto.TaskRequestDTO;
import com.lifesaver.dto.TaskResponseDTO;
import com.lifesaver.entity.Task;
import com.lifesaver.entity.Task.TaskStatus;
import com.lifesaver.entity.User;
import com.lifesaver.exception.ResourceNotFoundException;
import com.lifesaver.repository.TaskRepository;
import com.lifesaver.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    private TaskResponseDTO convertToDTO(Task task) {
        return TaskResponseDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .deadline(task.getDeadline())
                .priority(task.getPriority())
                .status(task.getStatus().name())
                .category(task.getCategory())
                .aiScheduledTime(task.getAiScheduledTime())
                .geminiReasoning(task.getGeminiReasoning())
                .createdAt(task.getCreatedAt())
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public List<TaskResponseDTO> getAllTasks(String email) {
        User user = getUserByEmail(email);
        List<Task> tasks = taskRepository.findByUserIdOrderByDeadlineAsc(user.getId());
        return tasks.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public TaskResponseDTO createTask(TaskRequestDTO dto, String email) {
        User user = getUserByEmail(email);

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .deadline(dto.getDeadline())
                .category(dto.getCategory())
                .status(TaskStatus.PENDING)
                .priority(5) // default priority, can be updated by AI later
                .user(user)
                .build();

        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    @Transactional
    public List<TaskResponseDTO> extractTasksFromAI(String text, String email) {
        User user = getUserByEmail(email);
        
        // Call Gemini to extract tasks
        List<TaskResponseDTO> extracted = geminiService.extractAndCreateTasks(text);
        List<TaskResponseDTO> savedDTOs = new ArrayList<>();

        for (TaskResponseDTO dto : extracted) {
            Task task = Task.builder()
                    .title(dto.getTitle())
                    .description(dto.getGeminiReasoning())
                    .deadline(dto.getDeadline() != null ? dto.getDeadline() : LocalDateTime.now().plusDays(1))
                    .priority(dto.getPriority() != null ? dto.getPriority() : 5)
                    .category(dto.getCategory() != null ? dto.getCategory() : "AI Extracted")
                    .geminiReasoning(dto.getGeminiReasoning())
                    .status(TaskStatus.PENDING)
                    .user(user)
                    .build();

            Task saved = taskRepository.save(task);
            savedDTOs.add(convertToDTO(saved));
        }

        return savedDTOs;
    }

    @Transactional
    public String getDailySchedule(String email) {
        User user = getUserByEmail(email);
        List<Task> pendingTasks = taskRepository.findByUserIdAndStatus(user.getId(), TaskStatus.PENDING);
        List<TaskResponseDTO> dtos = pendingTasks.stream().map(this::convertToDTO).collect(Collectors.toList());

        // Ask Gemini to generate schedule
        String schedule = geminiService.generateDailySchedule(dtos);

        // Update aiScheduledTime on the tasks as well
        LocalDateTime now = LocalDateTime.now();
        int offsetHours = 1;
        for (Task task : pendingTasks) {
            task.setAiScheduledTime(now.plusHours(offsetHours));
            taskRepository.save(task);
            offsetHours += 2;
        }

        return schedule;
    }

    public RescueModeDTO getRescueMode(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(now, task.getDeadline());
        
        long hours = duration.toHours();
        long minutes = duration.toMinutes() % 60;
        String timeRemaining = String.format("%d hours and %d minutes", hours, minutes);

        if (duration.isNegative()) {
            timeRemaining = "already passed";
        }

        return geminiService.generateRescueMode(task.getTitle(), timeRemaining);
    }

    @Transactional
    public TaskResponseDTO updateTaskStatus(Long taskId, String statusStr, String email) {
        User user = getUserByEmail(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this task");
        }

        TaskStatus status = TaskStatus.valueOf(statusStr.toUpperCase());
        task.setStatus(status);
        Task updated = taskRepository.save(task);
        return convertToDTO(updated);
    }

    @Transactional
    public TaskResponseDTO updateTask(Long taskId, TaskRequestDTO dto, String email) {
        User user = getUserByEmail(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this task");
        }

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDeadline(dto.getDeadline());
        task.setCategory(dto.getCategory());

        Task updated = taskRepository.save(task);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteTask(Long taskId, String email) {
        User user = getUserByEmail(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this task");
        }

        taskRepository.delete(task);
    }

    public String getMorningBriefing(String email) {
        User user = getUserByEmail(email);
        
        // Fetch tasks due today
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        List<Task> todayTasks = taskRepository.findByUserIdAndDeadlineBetween(user.getId(), startOfDay, endOfDay);
        List<TaskResponseDTO> todayDtos = todayTasks.stream().map(this::convertToDTO).collect(Collectors.toList());

        // Calculate task completion rate in past week
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<Task> pastWeekTasks = taskRepository.findByUserIdAndDeadlineBetween(user.getId(), oneWeekAgo, LocalDateTime.now());
        
        long totalTasks = pastWeekTasks.size();
        long completedTasks = pastWeekTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        double rate = totalTasks == 0 ? 100.0 : (double) completedTasks * 100.0 / totalTasks;

        return geminiService.generateMorningBriefing(todayDtos, rate);
    }

    @Transactional
    public List<TaskResponseDTO> prioritizeAllTasks(String email) {
        User user = getUserByEmail(email);
        List<Task> pendingTasks = taskRepository.findByUserIdAndStatus(user.getId(), TaskStatus.PENDING);
        if (pendingTasks.isEmpty()) {
            return new ArrayList<>();
        }

        // We priorize by checking their urgency and deadlines using Gemini
        for (Task task : pendingTasks) {
            String textToAnalyze = String.format("Title: %s, Description: %s, Deadline: %s", 
                    task.getTitle(), task.getDescription(), task.getDeadline());
            List<TaskResponseDTO> analysis = geminiService.extractAndCreateTasks(textToAnalyze);
            if (!analysis.isEmpty()) {
                TaskResponseDTO result = analysis.get(0);
                if (result.getPriority() != null) {
                    task.setPriority(result.getPriority());
                }
                if (result.getGeminiReasoning() != null) {
                    task.setGeminiReasoning(result.getGeminiReasoning());
                }
                taskRepository.save(task);
            }
        }

        return pendingTasks.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
}
