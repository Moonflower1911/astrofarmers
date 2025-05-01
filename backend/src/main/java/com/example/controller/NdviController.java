package com.example.ndvi;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;

@RestController
@RequestMapping("/ndvi")
public class NdviController {

    @PostMapping("/from-coords")
    public ResponseEntity<?> getNdviFromCoordinates(@RequestBody Map<String, Object> payload) {
        try {
            double lat = Double.parseDouble(payload.get("latitude").toString());
            double lon = Double.parseDouble(payload.get("longitude").toString());

            //  Ici tu peux automatiser avec Earth Engine plus tard
            String redPath = "uploads/B04.tif";
            String nirPath = "uploads/B08.tif";

            String jsonArgs = String.format("{\"red_band\": \"%s\", \"nir_band\": \"%s\"}",
                    redPath, nirPath);

            //ProcessBuilder pb = new ProcessBuilder("python3", "ndvi_processor.py", jsonArgs);
            ProcessBuilder pb = new ProcessBuilder("script-python\\venv\\Scripts\\python.exe", "ndvi_processor.py", jsonArgs);

            pb.directory(new File("script-python/")); // dossier du script
            pb.redirectErrorStream(true);
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) output.append(line);

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                return ResponseEntity.status(500).body("Erreur NDVI");
            }

            return ResponseEntity.ok(output.toString());

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur serveur : " + e.getMessage());
        }
    }
}

