package com.lifesaver.controller;

import com.lifesaver.dto.AIRequestDTO;
import com.lifesaver.dto.AIResponseDTO;
import com.lifesaver.dto.TaskResponseDTO;
import com.lifesaver.service.GeminiService;
import com.lifesaver.service.TaskService;
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
@RequestMapping("/api/ai")
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private TaskService taskService;

    private String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping("/chat")
    public ResponseEntity<AIResponseDTO> chatWithAI(@RequestBody AIRequestDTO request) {
        try {
            String answer = geminiService.chatWithAI(request.getMessage(), request.getUserContext());
            AIResponseDTO response = AIResponseDTO.builder()
                    .response(answer)
                    .success(true)
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIResponseDTO errorResponse = AIResponseDTO.builder()
                    .response("Error: " + e.getMessage())
                    .success(false)
                    .build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/briefing")
    public ResponseEntity<Map<String, String>> getMorningBriefing() {
        String email = getAuthenticatedUserEmail();
        String briefing = taskService.getMorningBriefing(email);
        Map<String, String> response = new HashMap<>();
        response.put("briefing", briefing);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/prioritize")
    public ResponseEntity<List<TaskResponseDTO>> prioritizeTasks() {
        String email = getAuthenticatedUserEmail();
        List<TaskResponseDTO> prioritizedTasks = taskService.prioritizeAllTasks(email);
        return ResponseEntity.ok(prioritizedTasks);
    }
}
