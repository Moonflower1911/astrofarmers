'use client';

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Land {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

export default function LandList() {
    const [lands, setLands] = useState<Land[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLands = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/lands/user/3", {
                    headers: {
                        Authorization:
                            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYWlkQGZhcm0uY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NDc0NTIyMDIsImV4cCI6MTc0NzUzODYwMn0.TvxlpeSnyM8-y5-qQdIizI66Bc4c4dbKXwT87kdp6t0",
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch lands");

                const data = await response.json();
                setLands(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchLands();
    }, []);

    if (loading) return <p>Loading lands...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ textAlign: "center" }}>🌾 Your Lands</h3>
            {lands.length === 0 ? (
                <p>No lands found.</p>
            ) : (
                lands.map((land) => (
                    <div
                        key={land.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "1rem",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                        }}
                    >
                        <h4 style={{ margin: 0 }}>{land.name}</h4>
                        <p style={{ margin: 0 }}>📍 {land.latitude}, {land.longitude}</p>
                        <div style={{ height: "200px", borderRadius: "8px", overflow: "hidden", marginTop: "0.5rem" }}>
                            <MapContainer
                                center={[land.latitude, land.longitude] as [number, number]}
                                zoom={13}
                                style={{ height: "100%", width: "100%" }}
                                scrollWheelZoom={false}
                                dragging={false}
                                doubleClickZoom={false}
                                zoomControl={false}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[land.latitude, land.longitude]} />
                            </MapContainer>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
