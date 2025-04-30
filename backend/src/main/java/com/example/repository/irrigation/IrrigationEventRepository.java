package com.example.repository.irrigation;

import com.example.entity.auth.User;
import com.example.entity.irrigation.IrrigationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IrrigationEventRepository extends JpaRepository<IrrigationEvent, Long> {

    @Query("SELECT e FROM IrrigationEvent e WHERE e.irrigationSchedule.user = :user")
    List<IrrigationEvent> findByUser(User user);
}
