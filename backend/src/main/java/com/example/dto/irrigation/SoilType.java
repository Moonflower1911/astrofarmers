package com.example.dto.irrigation;



public enum SoilType {
    SANDY(1.3),  // +30% water (drains fast)
    LOAMY(1.0),  // No adjustment
    CLAY(0.8);   // -20% water (retains moisture)

    private final double multiplier;

    SoilType(double multiplier) {
        this.multiplier = multiplier;
    }

    public double getMultiplier() {
        return multiplier;
    }
}
