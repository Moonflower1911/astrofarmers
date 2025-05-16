package com.example.controller.irrigation;

import com.example.model.irrigation.CropType;
import com.example.repository.irrigation.CropTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.security.JwtUtils;
import org.springframework.http.HttpStatus;


import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/crops")
public class CropTypeController {

    @Autowired
    private CropTypeRepository cropTypeRepository;

    @GetMapping
    public List<CropType> getAllCrops() {
        return cropTypeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CropType> getCropById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        return cropTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCrop(
            @RequestBody CropType cropType,
            @RequestHeader("Authorization") String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        cropTypeRepository.save(cropType);
        return ResponseEntity.status(HttpStatus.CREATED).body("Crop Type created successfully!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<CropType> updateCrop(
            @PathVariable Long id,
            @RequestBody CropType updatedCrop,
            @RequestHeader("Authorization") String authorizationHeader
    ) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Optional<CropType> optionalCrop = cropTypeRepository.findById(id);
        if (optionalCrop.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CropType crop = optionalCrop.get();
        crop.setName(updatedCrop.getName());
        crop.setBaseWaterRequirement(updatedCrop.getBaseWaterRequirement());
        crop.setMaxDailyIrrigation(updatedCrop.getMaxDailyIrrigation());
        crop.setSoilTypeAdjustment(updatedCrop.getSoilTypeAdjustment());
        crop.setGrowthStageDurations(updatedCrop.getGrowthStageDurations());
        crop.setMoistureThresholds(updatedCrop.getMoistureThresholds());

        return ResponseEntity.ok(cropTypeRepository.save(crop));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCrop(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader
            ) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        if (!cropTypeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cropTypeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

