package com.lifesaver.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescueModeDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RescueStep {
        private String step;
        private Integer durationMinutes;
    }

    private List<RescueStep> microSteps;
    private String minimumViableCompletion;
    private String motivationalMessage;
}
