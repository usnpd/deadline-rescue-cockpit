package com.lifesaver.controller;

import com.lifesaver.dto.HabitDTO;
import com.lifesaver.service.HabitService;
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
@RequestMapping("/api/habits")
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HabitController {

    @Autowired
    private HabitService habitService;

    private String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @GetMapping
    public ResponseEntity<List<HabitDTO>> getAllHabits() {
        String email = getAuthenticatedUserEmail();
        List<HabitDTO> habits = habitService.getAllHabits(email);
        return ResponseEntity.ok(habits);
    }

    @PostMapping
    public ResponseEntity<HabitDTO> createHabit(@RequestBody HabitDTO dto) {
        String email = getAuthenticatedUserEmail();
        HabitDTO habit = habitService.createHabit(dto, email);
        return ResponseEntity.ok(habit);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<HabitDTO> markComplete(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        HabitDTO completedHabit = habitService.markComplete(id, email);
        return ResponseEntity.ok(completedHabit);
    }

    @GetMapping("/analysis")
    public ResponseEntity<Map<String, String>> getHabitAnalysis() {
        String email = getAuthenticatedUserEmail();
        String analysis = habitService.getHabitAnalysis(email);
        Map<String, String> response = new HashMap<>();
        response.put("analysis", analysis);
        return ResponseEntity.ok(response);
    }
}
