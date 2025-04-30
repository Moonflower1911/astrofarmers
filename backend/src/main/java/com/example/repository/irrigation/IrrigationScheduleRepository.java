package com.example.repository.irrigation;

import com.example.entity.auth.User;
import com.example.entity.irrigation.IrrigationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IrrigationScheduleRepository extends JpaRepository<IrrigationSchedule, Long> {

    List<IrrigationSchedule> findByUser(User user);
}