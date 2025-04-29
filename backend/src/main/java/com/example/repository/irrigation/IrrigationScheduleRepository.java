package com.example.repository.irrigation;

import com.example.entity.irrigation.IrrigationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IrrigationScheduleRepository extends JpaRepository<IrrigationSchedule, Long> {
}