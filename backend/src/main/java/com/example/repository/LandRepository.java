package com.example.repository;

import com.example.model.Land;
import com.example.model.auth.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface LandRepository extends JpaRepository<Land, Long> {
    List<Land> findByUser(User user);
}
