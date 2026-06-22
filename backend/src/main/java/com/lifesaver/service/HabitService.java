package com.lifesaver.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesaver.dto.HabitDTO;
import com.lifesaver.entity.Habit;
import com.lifesaver.entity.User;
import com.lifesaver.exception.ResourceNotFoundException;
import com.lifesaver.repository.HabitRepository;
import com.lifesaver.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class HabitService {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ObjectMapper objectMapper;

    private HabitDTO convertToDTO(Habit habit) {
        return HabitDTO.builder()
                .id(habit.getId())
                .name(habit.getName())
                .currentStreak(habit.getCurrentStreak())
                .longestStreak(habit.getLongestStreak())
                .completedDates(new ArrayList<>(habit.getCompletedDates()))
                .targetFrequency(habit.getTargetFrequency())
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public List<HabitDTO> getAllHabits(String email) {
        User user = getUserByEmail(email);
        List<Habit> habits = habitRepository.findByUserId(user.getId());
        return habits.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public HabitDTO createHabit(HabitDTO dto, String email) {
        User user = getUserByEmail(email);

        Habit habit = Habit.builder()
                .name(dto.getName())
                .targetFrequency(dto.getTargetFrequency() != null ? dto.getTargetFrequency() : "Daily")
                .user(user)
                .completedDates(new ArrayList<>())
                .currentStreak(0)
                .longestStreak(0)
                .build();

        Habit saved = habitRepository.save(habit);
        return convertToDTO(saved);
    }

    @Transactional
    public HabitDTO markComplete(Long habitId, String email) {
        User user = getUserByEmail(email);
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));

        if (!habit.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this habit");
        }

        LocalDate today = LocalDate.now();
        List<LocalDate> completedDates = habit.getCompletedDates();

        if (!completedDates.contains(today)) {
            completedDates.add(today);
            Collections.sort(completedDates);
            
            // Recalculate Streaks
            int currentStreak = calculateStreak(completedDates);
            habit.setCurrentStreak(currentStreak);

            if (currentStreak > habit.getLongestStreak()) {
                habit.setLongestStreak(currentStreak);
            }

            habitRepository.save(habit);
        }

        return convertToDTO(habit);
    }

    private int calculateStreak(List<LocalDate> completedDates) {
        if (completedDates == null || completedDates.isEmpty()) {
            return 0;
        }

        Set<LocalDate> dateSet = new HashSet<>(completedDates);
        LocalDate checkDate = LocalDate.now();
        int streak = 0;

        // If today is completed, start counting from today.
        // Otherwise, check if yesterday was completed to continue streak.
        if (dateSet.contains(checkDate)) {
            while (dateSet.contains(checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            }
        } else if (dateSet.contains(checkDate.minusDays(1))) {
            checkDate = checkDate.minusDays(1);
            while (dateSet.contains(checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            }
        }

        return streak;
    }

    public String getHabitAnalysis(String email) {
        List<HabitDTO> habits = getAllHabits(email);
        if (habits.isEmpty()) {
            return "No habit data available yet. Start tracking a habit to get AI insights!";
        }

        try {
            // Build a simplified habit data structure for prompt size efficiency
            List<Map<String, Object>> analysisData = new ArrayList<>();
            for (HabitDTO h : habits) {
                Map<String, Object> map = new HashMap<>();
                map.put("name", h.getName());
                map.put("currentStreak", h.getCurrentStreak());
                map.put("longestStreak", h.getLongestStreak());
                map.put("totalCompletions", h.getCompletedDates().size());
                map.put("frequency", h.getTargetFrequency());
                analysisData.add(map);
            }
            
            String habitJson = objectMapper.writeValueAsString(analysisData);
            return geminiService.analyzeHabits(habitJson);
        } catch (Exception e) {
            log.error("Failed to serialize habit data for analysis", e);
            return "Failed to analyze habits. Keep completing your habits daily to stay on track!";
        }
    }
}
