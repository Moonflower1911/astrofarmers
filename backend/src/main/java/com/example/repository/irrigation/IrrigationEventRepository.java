package com.example.repository.irrigation;

import com.example.entity.irrigation.IrrigationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IrrigationEventRepository extends JpaRepository<IrrigationEvent, Long> {
}
