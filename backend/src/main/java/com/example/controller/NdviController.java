package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;

@RestController
@RequestMapping("/ndvi")
public class NdviController {

    private static final String BASE_DIR = "C:/Users/Rim/Desktop/Projets_2a/Hamlaoui/development-platform-astrofarmers/backend/";
    private static final String PYTHON_EXE = BASE_DIR + "script_python/venv/Scripts/python.exe";

    @PostMapping("/from-coords")
    public ResponseEntity<?> processNdviRequest(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Validation et conversion des coordonnées
            double lat = convertToDouble(payload.get("latitude"));
            double lon = convertToDouble(payload.get("longitude"));

            // 2. Construction MANUELLE du JSON valide
            String coordsJson = buildJson(lat, lon);
            System.out.println("JSON envoyé à Python: " + coordsJson); // Log de vérification

            // 3. Téléchargement des bandes
            String downloadOutput = executePythonScript(
                    "download_bands.py",
                    coordsJson
            );

            // 4. Calcul NDVI
            String ndviArgs = buildNdviArgs();
            String ndviOutput = executePythonScript("ndvi_processor.py", ndviArgs);

            return ResponseEntity.ok(ndviOutput);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    "{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}"
            );
        }
    }

    private double convertToDouble(Object value) {
        return Double.parseDouble(value.toString().replace(',', '.'));
    }

    private String buildJson(double lat, double lon) {
        // Formatage manuel avec guillemets doubles échappés
        return String.format(Locale.US, "\"{\\\"lat\\\":%.6f,\\\"lon\\\":%.6f}\"", lat, lon);
    }

    private String buildNdviArgs() {
        return String.format(
                "\"{\\\"red_path\\\":\\\"%s\\\",\\\"nir_path\\\":\\\"%s\\\",\\\"output_path\\\":\\\"%s\\\"}\"",
                BASE_DIR + "script_python/uploads/B04/response.tiff",
                BASE_DIR + "script_python/uploads/B08/response.tiff",
                BASE_DIR + "script_python/output/ndvi_map.png"
        );
    }

    private String executePythonScript(String scriptName, String args) throws Exception {
        Process process = new ProcessBuilder(
                PYTHON_EXE,
                BASE_DIR + "script_python/" + scriptName,
                args
        )
                .directory(new File(BASE_DIR))
                .redirectErrorStream(true)
                .start();

        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException(output);
        }
        return output;
    }
}