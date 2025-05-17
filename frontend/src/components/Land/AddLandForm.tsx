'use client';

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function AddLandForm() {
    const [name, setName] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coords) {
            setMessage("❌ Please choose a location on the map.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/lands/add?userId=3", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYWlkQGZhcm0uY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NDc0NTIyMDIsImV4cCI6MTc0NzUzODYwMn0.TvxlpeSnyM8-y5-qQdIizI66Bc4c4dbKXwT87kdp6t0"
                },
                body: JSON.stringify({
                    name: name,
                    latitude: coords.lat,
                    longitude: coords.lng,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setMessage("✅ Land added: " + result.name);
                setName("");
                setCoords(null);
            } else {
                setMessage("❌ Failed to add land.");
            }
        } catch (error) {
            setMessage("❌ Error: " + (error as Error).message);
        }
    };

    function LocationPicker() {
        useMapEvents({
            click(e: LeafletMouseEvent) {
                setCoords(e.latlng);
            },
        });
        return coords ? <Marker position={coords} /> : null;
    }

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center", // ⬅️ vertically center
                minHeight: "100vh",
                backgroundColor: "#f0f0f0", // optional: light background
                padding: "2rem",
            }}
        >
            <div
                style={{
                    maxWidth: "700px",
                    width: "100%",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>🌾 Add Land</h2>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <label style={{ fontWeight: "bold" }}>Land Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Olive Farm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{
                            padding: "0.75rem",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                        }}
                    />

                    <div style={{ fontSize: "0.95rem", color: "#333" }}>
                        📍 Location:
                        <br />
                        Latitude: <strong>{coords?.lat ?? "--"}</strong>, Longitude: <strong>{coords?.lng ?? "--"}</strong>
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: "0.75rem",
                            border: "none",
                            borderRadius: "5px",
                            backgroundColor: "#4CAF50",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        Add Land
                    </button>

                    {message && (
                        <p style={{ marginTop: "0.5rem", fontWeight: "bold", color: message.startsWith("✅") ? "green" : "red" }}>
                            {message}
                        </p>
                    )}
                </form>

                <div style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}>
                    <MapContainer center={[33.57, -7.58] as [number, number]} zoom={6} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker />
                    </MapContainer>
                </div>
            </div>
        </div>
    );

}
