package com.example.entity.irrigation;

import com.example.model.irrigation.MoistureThreshold;
import com.example.model.irrigation.SoilType;
import jakarta.persistence.*;
import java.util.Map;

@Entity
public class CropType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    private double baseWaterRequirement; // in mm/day
    private double maxDailyIrrigation;   // in mm/day
    private SoilType soilTypeAdjustment; // Soil-specific adjustment factor

    @ElementCollection
    @CollectionTable(name = "crop_growth_stages", joinColumns = @JoinColumn(name = "crop_type_id"))
    @MapKeyColumn(name = "stage")
    @Column(name = "duration_in_days")
    private Map<String, Integer> growthStageDurations;

    @ElementCollection
    @CollectionTable(name = "moisture_thresholds", joinColumns = @JoinColumn(name = "crop_type_id"))
    @MapKeyColumn(name = "stage")
    private Map<String, MoistureThreshold> moistureThresholds;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Map<String, Integer> getGrowthStageDurations() { return growthStageDurations; }
    public void setGrowthStageDurations(Map<String, Integer> growthStageDurations) { this.growthStageDurations = growthStageDurations; }
    public Map<String, MoistureThreshold> getMoistureThresholds() { return moistureThresholds; }
    public void setMoistureThresholds(Map<String, MoistureThreshold> moistureThresholds) { this.moistureThresholds = moistureThresholds; }
    public double getBaseWaterRequirement() { return baseWaterRequirement; }
    public void setBaseWaterRequirement(double baseWaterRequirement) { this.baseWaterRequirement = baseWaterRequirement; }
    public double getMaxDailyIrrigation() { return maxDailyIrrigation; }
    public void setMaxDailyIrrigation(double maxDailyIrrigation) { this.maxDailyIrrigation = maxDailyIrrigation; }
    public SoilType getSoilTypeAdjustment() { return soilTypeAdjustment; }
    public void setSoilTypeAdjustment(SoilType soilTypeAdjustment) { this.soilTypeAdjustment = soilTypeAdjustment; }

    public MoistureThreshold getMoistureThresholdForStage(String stage) {
        return moistureThresholds.getOrDefault(stage, new MoistureThreshold(10.0, 50.0));
    }
}