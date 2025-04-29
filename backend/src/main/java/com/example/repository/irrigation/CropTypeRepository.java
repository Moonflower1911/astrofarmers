package com.example.repository.irrigation;

import com.example.entity.irrigation.CropType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CropTypeRepository extends JpaRepository<CropType, Long> {
}