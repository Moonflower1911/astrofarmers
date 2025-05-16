package com.example.entity.irrigation;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class IrrigationEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate eventDate;
    private double irrigationAmount;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean done;

    @ManyToOne
    private IrrigationSchedule irrigationSchedule;

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public double getIrrigationAmount() {
        return irrigationAmount;
    }

    public void setIrrigationAmount(double irrigationAmount) {
        this.irrigationAmount = irrigationAmount;
    }

    public IrrigationSchedule getIrrigationSchedule() {
        return irrigationSchedule;
    }

    public void setIrrigationSchedule(IrrigationSchedule irrigationSchedule) {
        this.irrigationSchedule = irrigationSchedule;
    }
}

