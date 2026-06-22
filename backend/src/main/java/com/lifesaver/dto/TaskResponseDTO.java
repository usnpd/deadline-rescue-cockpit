package com.lifesaver.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Integer priority;
    private String status;
    private String category;
    private LocalDateTime aiScheduledTime;
    private String geminiReasoning;
    private LocalDateTime createdAt;
}
