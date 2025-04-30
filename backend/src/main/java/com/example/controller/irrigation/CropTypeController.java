package com.example.controller.irrigation;

import com.example.entity.irrigation.CropType;
import com.example.repository.irrigation.CropTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<CropType> getCropById(@PathVariable Long id) {
        return cropTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CropType createCrop(@RequestBody CropType cropType) {
        return cropTypeRepository.save(cropType);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CropType> updateCrop(@PathVariable Long id, @RequestBody CropType updatedCrop) {
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
    public ResponseEntity<Void> deleteCrop(@PathVariable Long id) {
        if (!cropTypeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cropTypeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

