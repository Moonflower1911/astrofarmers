package com.example.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/ndvi")
public class NdviController {

    @Value("${python.venv_path}")
    private String pythonVenvPath;

    @Value("${python.scripts_dir}")
    private String pythonScriptsDir;

    @PostMapping("/from-coords")
    public ResponseEntity<?> processNdviRequest(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Validate and convert coordinates
            double lat = convertToDouble(payload.get("latitude"));
            double lon = convertToDouble(payload.get("longitude"));

            // 2. Execute NDVI download script
            String downloadOutput = executePythonScript(
                    "download_ndvi.py",
                    String.format(Locale.US, "%f %f", lon, lat)
            );

            // 3. Calculate and generate NDVI map
            String calculateOutput = executePythonScript("calculate.py", "");

            // 4. Parse and return results
            String result = parsePythonOutput(calculateOutput);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    private double convertToDouble(Object value) {
        return Double.parseDouble(value.toString().replace(',', '.'));
    }

    private String parsePythonOutput(String output) {
        Map<String, String> result = new HashMap<>();
        String[] lines = output.split("\n");

        for (String line : lines) {
            if (line.startsWith("NDVI stats")) {
                result.put("stats", line.substring(line.indexOf("—") + 1).trim());
            } else if (line.startsWith("Interpretation")) {
                result.put("interpretation", line.substring(line.indexOf(":") + 1).trim());
            } else if (line.startsWith("Image NDVI")) {
                result.put("imagePath", line.substring(line.indexOf(":") + 1).trim());
            } else if (line.startsWith("Dernieres valeurs")) {
                String values = line.substring(line.indexOf(":") + 1).trim();
                result.put("ndviValues", values.isEmpty() ? "[]" : values);
            }
        }

        // Convert map to JSON string
        return String.format(
                "{\"stats\":\"%s\",\"interpretation\":\"%s\",\"imagePath\":\"%s\",\"ndviValues\":%s}",
                result.getOrDefault("stats", ""),
                result.getOrDefault("interpretation", ""),
                result.getOrDefault("imagePath", ""),
                result.getOrDefault("ndviValues", "[]")
        );
    }

    private String executePythonScript(String scriptName, String args) throws Exception {
        // Determine OS-specific Python executable path
        String pythonExecutable = Paths.get(pythonVenvPath)
                .resolve(isWindows() ? "Scripts/python.exe" : "bin/python")
                .toString();

        // Build the process command
        List<String> command = new ArrayList<>();
        command.add(pythonExecutable);
        command.add(Paths.get(pythonScriptsDir, scriptName).toString());

        if (!args.isEmpty()) {
            command.addAll(Arrays.asList(args.split(" ")));
        }

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(new File(pythonScriptsDir));
        pb.redirectErrorStream(true);

        Process process = pb.start();
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException(
                    String.format("Python script failed (exit %d): %s", exitCode, output)
            );
        }
        return output;
    }

    private boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }
}