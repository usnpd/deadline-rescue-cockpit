package com.lifesaver.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitDTO {
    private Long id;
    private String name;
    private Integer currentStreak;
    private Integer longestStreak;
    private List<LocalDate> completedDates;
    private String targetFrequency;
}
