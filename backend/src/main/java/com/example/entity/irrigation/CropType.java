package com.example.entity.irrigation;

import com.example.model.irrigation.MoistureThreshold;
import jakarta.persistence.*;

import java.util.Map;

@Entity
public class CropType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Stage → Duration in days (e.g. "Germination" → 15)
    @ElementCollection
    @CollectionTable(name = "crop_growth_stages", joinColumns = @JoinColumn(name = "crop_type_id"))
    @MapKeyColumn(name = "stage")
    @Column(name = "duration_in_days")
    private Map<String, Integer> growthStageDurations;

    // Stage → Moisture threshold (min/max)
    @ElementCollection
    @CollectionTable(name = "moisture_thresholds", joinColumns = @JoinColumn(name = "crop_type_id"))
    @MapKeyColumn(name = "stage")
    private Map<String, MoistureThreshold> moistureThresholds;

    // === Getters & Setters ===

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Map<String, Integer> getGrowthStageDurations() {
        return growthStageDurations;
    }

    public void setGrowthStageDurations(Map<String, Integer> growthStageDurations) {
        this.growthStageDurations = growthStageDurations;
    }

    public Map<String, MoistureThreshold> getMoistureThresholds() {
        return moistureThresholds;
    }

    public void setMoistureThresholds(Map<String, MoistureThreshold> moistureThresholds) {
        this.moistureThresholds = moistureThresholds;
    }

    public MoistureThreshold getMoistureThresholdForStage(String stage) {
        return moistureThresholds.getOrDefault(stage, new MoistureThreshold(10.0, 50.0));
    }
}
