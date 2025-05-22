'use client';

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon


export default function AddLandForm() {
    const [name, setName] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [message, setMessage] = useState<string | null>(null);


    useEffect(() => {
        // ✅ Safe in browser
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coords) {
            setMessage("❌ Please choose a location on the map.");
            return;
        }
        if (typeof window === 'undefined') return;

        const userId = localStorage.getItem("idUtilisateur");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            setMessage("❌ You must be logged in to add land.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/lands/add?userId=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
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
        <div className="flex justify-center items-center mb-8 px-4">
            <div className="w-full max-w-[700px] bg-white dark:bg-gray-dark rounded-lg shadow-lg p-8 sm:p-12 flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-center text-dark dark:text-white">🌾 Add Land</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block font-semibold text-dark dark:text-white mb-2">Land Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Olive Farm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-md border border-stroke dark:border-dark-3 bg-transparent dark:bg-dark-2 px-4 py-3 text-dark dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div className="text-sm text-dark dark:text-white">
                        📍 Location:
                        <br />
                        Latitude: <strong>{coords?.lat ?? "--"}</strong>, Longitude: <strong>{coords?.lng ?? "--"}</strong>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-md bg-green-600 text-white font-semibold py-3 hover:bg-green-700 transition"
                    >
                        Add Land
                    </button>

                    {message && (
                        <p className={`text-center font-semibold ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                            {message}
                        </p>
                    )}
                </form>

                <div className="h-[400px] w-full rounded-lg overflow-hidden">
                    <MapContainer
                        center={[33.57, -7.58] as [number, number]}
                        zoom={6}
                        className="h-full w-full"
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker />
                    </MapContainer>
                </div>
            </div>
        </div>
    );


}
