package com.example.dto.irrigation;

import jakarta.persistence.Embeddable;

@Embeddable
public class MoistureThreshold {
    private double minMoisture;
    private double maxMoisture;

    public MoistureThreshold() {}

    public MoistureThreshold(double minMoisture, double maxMoisture) {
        this.minMoisture = minMoisture;
        this.maxMoisture = maxMoisture;
    }

    public double getMinMoisture() {
        return minMoisture;
    }

    public void setMinMoisture(double minMoisture) {
        this.minMoisture = minMoisture;
    }

    public double getMaxMoisture() {
        return maxMoisture;
    }

    public void setMaxMoisture(double maxMoisture) {
        this.maxMoisture = maxMoisture;
    }
}