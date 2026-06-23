package com.lifesaver.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesaver.dto.RescueModeDTO;
import com.lifesaver.dto.TaskResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class GeminiService {


    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${ollama.api.url}")
    private String apiUrl;

    @Value("${ollama.model}")
    private String modelName;

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("OllamaService initialized with model: {}", modelName);
        log.info("Ollama API URL: {}", apiUrl);
    }

    /**
     * Helper to clean markdown JSON wrappers from Gemini responses
     */
    private String cleanJsonResponse(String rawResponse) {
        if (rawResponse == null) return "";
        rawResponse = rawResponse.trim();
        if (rawResponse.startsWith("```json")) {
            rawResponse = rawResponse.substring(7);
        } else if (rawResponse.startsWith("```")) {
            rawResponse = rawResponse.substring(3);
        }
        if (rawResponse.endsWith("```")) {
            rawResponse = rawResponse.substring(0, rawResponse.length() - 3);
        }
        return rawResponse.trim();
    }

    /**
     * Generic method to call Ollama API (keeping name callGemini to avoid refactoring callers)
     */
    private String callGemini(String prompt) {
        log.info("Calling Ollama API (Model: {}) with prompt: {}", modelName, prompt.substring(0, Math.min(prompt.length(), 100)) + "...");
        try {
            // Build the Ollama API request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("prompt", prompt);
            requestBody.put("stream", false);
            
            Map<String, Object> options = new HashMap<>();
            options.put("temperature", 0.2); // low temperature for structured data
            requestBody.put("options", options);

            String responseJson = webClientBuilder.build()
                    .post()
                    .uri(apiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(); // synchronous call

            JsonNode rootNode = objectMapper.readTree(responseJson);
            JsonNode responseNode = rootNode.path("response");
            if (responseNode.isTextual()) {
                return responseNode.asText();
            }
            throw new RuntimeException("Unexpected response format from Ollama API");
        } catch (Exception e) {
            log.error("Error calling Ollama API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call Ollama AI: " + e.getMessage());
        }
    }

    // 1. extractAndCreateTasks
    public List<TaskResponseDTO> extractAndCreateTasks(String userInput) {
        String prompt = "Extract all tasks from this text and return ONLY a JSON array. " +
                "No explanation, no markdown, just raw JSON array. " +
                "Format: [{\"title\": \"string\", \"deadline\": \"ISO datetime string (e.g. YYYY-MM-DDTHH:MM:SS)\", " +
                "\"priority\": number 1-10, \"category\": \"string\", \"geminiReasoning\": \"string\"}] " +
                "If no deadline is mentioned, assume a reasonable deadline based on the context. " +
                "Current datetime: " + LocalDateTime.now() + "\n" +
                "Text: " + userInput;

        try {
            String response = callGemini(prompt);
            String cleanJson = cleanJsonResponse(response);
            log.info("Extracted tasks JSON: {}", cleanJson);
            return objectMapper.readValue(cleanJson, new TypeReference<List<TaskResponseDTO>>() {});
        } catch (Exception e) {
            log.error("Failed to parse extracted tasks. Using fallback.", e);
            // Fallback: Create a single task
            TaskResponseDTO fallback = TaskResponseDTO.builder()
                    .title("Unstructured Task: Review Input")
                    .description(userInput.substring(0, Math.min(userInput.length(), 200)))
                    .deadline(LocalDateTime.now().plusDays(1))
                    .priority(5)
                    .status("PENDING")
                    .category("General")
                    .geminiReasoning("Fallback created due to parsing errors.")
                    .createdAt(LocalDateTime.now())
                    .build();
            return Collections.singletonList(fallback);
        }
    }

    // 2. generateDailySchedule
    public String generateDailySchedule(List<TaskResponseDTO> tasks) {
        if (tasks.isEmpty()) {
            return "No pending tasks to schedule today!";
        }

        StringBuilder taskSummary = new StringBuilder();
        for (TaskResponseDTO t : tasks) {
            taskSummary.append(String.format("- ID %d: %s (Priority: %d, Deadline: %s)\n",
                    t.getId(), t.getTitle(), t.getPriority(), t.getDeadline()));
        }

        String prompt = "Create an optimal time-blocked schedule for today based on these tasks. " +
                "Consider deadlines and priorities. Return a clean, formatted schedule in readable markdown " +
                "with emojis, indicating time blocks (e.g. 09:00 AM - 10:30 AM : task description). " +
                "Tasks:\n" + taskSummary + "\n" +
                "Current time: " + LocalDateTime.now();

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            log.error("Failed to generate schedule from Gemini. Using fallback.", e);
            return "### Today's Schedule (Fallback)\n" +
                    "* 09:00 AM - 11:00 AM: Focus on high priority tasks.\n" +
                    "* 02:00 PM - 04:00 PM: Finish remaining tasks due soon.";
        }
    }

    // 3. generateRescueMode
    public RescueModeDTO generateRescueMode(String taskTitle, String timeRemaining) {
        String prompt = "Task '" + taskTitle + "' is due in " + timeRemaining + ". " +
                "Create an emergency completion plan. Return ONLY a JSON object (no markdown, no code block wrapper): " +
                "{\n" +
                "  \"microSteps\": [\n" +
                "    { \"step\": \"action string\", \"durationMinutes\": 10 }\n" +
                "  ],\n" +
                "  \"minimumViableCompletion\": \"string describing bare minimum to submit/complete to avoid failure\",\n" +
                "  \"motivationalMessage\": \"string, urgent and short\"\n" +
                "}";

        try {
            String response = callGemini(prompt);
            String cleanJson = cleanJsonResponse(response);
            log.info("Rescue Mode JSON: {}", cleanJson);
            return objectMapper.readValue(cleanJson, RescueModeDTO.class);
        } catch (Exception e) {
            log.error("Failed to generate Rescue Mode. Using fallback.", e);
            // Fallback
            RescueModeDTO.RescueStep step1 = RescueModeDTO.RescueStep.builder()
                    .step("Identify the core requirements and draft a minimal outline.")
                    .durationMinutes(15)
                    .build();
            RescueModeDTO.RescueStep step2 = RescueModeDTO.RescueStep.builder()
                    .step("Build the bare minimum functional components (no polish).")
                    .durationMinutes(45)
                    .build();
            RescueModeDTO.RescueStep step3 = RescueModeDTO.RescueStep.builder()
                    .step("Quick verification and immediate submission.")
                    .durationMinutes(15)
                    .build();
            return RescueModeDTO.builder()
                    .microSteps(Arrays.asList(step1, step2, step3))
                    .minimumViableCompletion("Submit the core functionality immediately, bypass styling/documentation.")
                    .motivationalMessage("Breathe! You can still salvage this. Focus completely and get it done step-by-step!")
                    .build();
        }
    }

    // 4. generateMorningBriefing
    public String generateMorningBriefing(List<TaskResponseDTO> tasks, double rate) {
        StringBuilder taskSummary = new StringBuilder();
        if (tasks.isEmpty()) {
            taskSummary.append("No critical tasks due today!");
        } else {
            for (TaskResponseDTO t : tasks) {
                taskSummary.append(t.getTitle()).append(", ");
            }
        }

        String prompt = "Generate a short motivational morning briefing for a student/professional. " +
                "Current date: " + java.time.LocalDate.now() + ". " +
                "Tasks due today: " + taskSummary + ". Past completion rate: " + rate + "%. " +
                "Be concise, energetic, and specific. Max 3 sentences.";

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            log.error("Failed to generate morning briefing. Using fallback.", e);
            return "Good morning! You completed " + rate + "% of tasks last week. Let's maintain the momentum today and knock out your critical items early!";
        }
    }

    // 5. analyzeHabits
    public String analyzeHabits(String habitJson) {
        String prompt = "Analyze these habit completion patterns and give 3 specific, actionable insights. " +
                "Current date: " + java.time.LocalDate.now() + ". " +
                "Habits data: " + habitJson + ". " +
                "Return insights as a numbered markdown list (1, 2, 3), max 2 lines per insight.";

        try {
            String response = callGemini(prompt);
            return response;
        } catch (Exception e) {
            log.error("Failed to analyze habits. Using fallback.", e);
            return "1. Consistency is key: Try completing habits at the same time each day.\n" +
                    "2. Build streaks: Aim for a 5-day streak on your lowest habit to build muscle memory.\n" +
                    "3. Bundle habits: Link your habits to existing daily routines.";
        }
    }

    // 6. chatWithAI
    public String chatWithAI(String message, String context) {
        String prompt = "You are a productivity coach AI. Be concise and actionable. " +
                "Current date/time: " + java.time.LocalDateTime.now() + "\n" +
                "User's current tasks and habits context: " + context + "\n" +
                "User message: " + message + "\n" +
                "Reply in max 3 sentences. Be direct.";

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            log.error("Failed to chat with AI. Using fallback.", e);
            return "I'm having trouble connecting to my coaching database. Focus on your highest priority task and eliminate distractions for the next 25 minutes!";
        }
    }
}