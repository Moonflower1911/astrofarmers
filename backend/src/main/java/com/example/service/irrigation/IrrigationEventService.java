package com.example.service.irrigation;

import com.example.entity.auth.User;
import com.example.entity.irrigation.IrrigationEvent;
import com.example.repository.irrigation.IrrigationEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IrrigationEventService {

    private final IrrigationEventRepository repository;

    public IrrigationEventService(IrrigationEventRepository repository) {
        this.repository = repository;
    }

    public List<IrrigationEvent> getEventsByUser(User user) {
        return repository.findByUser(user);
    }

    public IrrigationEvent markEventAsDone(Long eventId) {
        IrrigationEvent event = repository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        event.setDone(true);
        return repository.save(event);
    }
}
