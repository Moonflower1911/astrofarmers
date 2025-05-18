package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;

@RestController
@RequestMapping("/ndvi")
public class NdviController {
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! attention a base_dir
    private static final String BASE_DIR = "C:/Users/ASUS/Desktop/development-platform-astrofarmers/backend/";;
    private static final String PYTHON_EXE = BASE_DIR + "script_python/venv/Scripts/python.exe";

    @PostMapping("/from-coords")
    public ResponseEntity<?> processNdviRequest(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Validation et conversion des coordonnées
            double lat = convertToDouble(payload.get("latitude"));
            double lon = convertToDouble(payload.get("longitude"));

            // 2. Exécution du script de téléchargement NDVI
            String downloadOutput = executePythonScript(
                    "download_ndvi.py",
                    String.format(Locale.US, "%f %f", lon, lat)
            );

            // 3. Calcul et génération de la carte NDVI
            String calculateOutput = executePythonScript("calculate.py", "");

            // 4. Lecture des résultats
            String result = parsePythonOutput(calculateOutput);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    "{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}"
            );
        }
    }

    private double convertToDouble(Object value) {
        return Double.parseDouble(value.toString().replace(',', '.'));
    }

    private String parsePythonOutput(String output) {
        String stats = "";
        String interpretation = "";
        String imagePath = "";
        String ndviValues = "";

        for (String line : output.split("\n")) {
            if (line.startsWith("NDVI stats")) {
                stats = line.substring(line.indexOf("—") + 1).trim();
            } else if (line.startsWith("Interpretation")) {
                interpretation = line.substring(line.indexOf(":") + 1).trim();
            } else if (line.startsWith("Image NDVI")) {
                imagePath = line.substring(line.indexOf(":") + 1).trim();
            } else if (line.startsWith("Dernieres valeurs")) {
                ndviValues = line.substring(line.indexOf(":") + 1).trim();
            }
        }

        // Retour JSON complet avec ndviValues comme tableau JSON
        return String.format(
                "{\"stats\":\"%s\",\"interpretation\":\"%s\",\"imagePath\":\"%s\",\"ndviValues\":%s}",
                stats, interpretation, imagePath, ndviValues.isEmpty() ? "[]" : ndviValues
        );
    }


    private String executePythonScript(String scriptName, String args) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
                PYTHON_EXE,
                BASE_DIR + "script_python/" + scriptName
        );

        if (!args.isEmpty()) {
            pb.command().addAll(Arrays.asList(args.split(" ")));
        }

        pb.directory(new File(BASE_DIR + "script_python/"));
        pb.redirectErrorStream(true);

        Process process = pb.start();
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException("Script Python échoué: " + output);
        }
        return output;
    }
}