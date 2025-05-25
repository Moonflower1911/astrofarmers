'use client';

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ✅ Fix for missing marker icons in Next.js
// @ts-ignore



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
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x.src,
            iconUrl: markerIcon.src,
            shadowUrl: markerShadow.src,
        });
    }, []);


    useEffect(() => {
        const fetchLands = async () => {

            const userId = localStorage.getItem("idUtilisateur");
            const token = localStorage.getItem("token");

            if (!userId || !token) {
                setError("❌ You must be logged in to view lands.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/lands/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch lands: ${response.status} - ${errorText}`);
                }
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
        <div className="flex flex-col gap-6">
            <h3 className="text-center text-2xl font-bold text-dark dark:text-white">
                🌾 Your Lands
            </h3>

            {lands.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center">No lands found.</p>
            ) : (
                lands.map((land) => (
                    <div
                        key={land.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-dark shadow-sm flex flex-col gap-2"
                    >
                        <h4 className="text-lg font-semibold text-dark dark:text-white">
                            {land.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            📍 {land.latitude}, {land.longitude}
                        </p>
                        <div className="h-[200px] rounded-lg overflow-hidden mt-2 border border-stroke dark:border-dark-3">
                            <MapContainer
                                center={[land.latitude, land.longitude] as [number, number]}
                                zoom={13}
                                className="h-full w-full"
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
