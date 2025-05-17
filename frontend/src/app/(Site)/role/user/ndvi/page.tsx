'use client';
import { useState } from "react";
import UserLayout from "@/components/Layouts/UserLayout";
import NDVIMap from "@/components/NDVI/NDVIMap";
import NDVIResults from "@/components/NDVI/NDVIResults";

export default function NDVIAnalysisPage() {
    const [activeTab, setActiveTab] = useState<"map" | "results">("map");
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [ndviData, setNdviData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLocationSelect = async (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });
        setIsLoading(true);

        try {
            const response = await fetch('/api/ndvi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latitude: lat, longitude: lng }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données NDVI');
            }

            const data = await response.json();

            // ✅ Traitement des statistiques (objet ou chaîne)
            let stats = { min: 0, max: 0, mean: 0 };

            if (typeof data.stats === 'string') {
                const statsMatch = data.stats.match(/min: ([\d.]+), max: ([\d.]+), mean: ([\d.]+)/);
                if (statsMatch) {
                    stats = {
                        min: parseFloat(statsMatch[1]),
                        max: parseFloat(statsMatch[2]),
                        mean: parseFloat(statsMatch[3]),
                    };
                }
            } else if (typeof data.stats === 'object' && data.stats !== null) {
                stats = {
                    min: parseFloat(data.stats.min) || 0,
                    max: parseFloat(data.stats.max) || 0,
                    mean: parseFloat(data.stats.mean) || 0,
                };
            }

            const cleanData = {
                stats,
                interpretation: data.interpretation || "Aucune interprétation fournie.",
                imagePath: data.imagePath || "",
                ndviValues: Array.isArray(data.ndviValues) ? data.ndviValues : [],
            };

            setNdviData(cleanData);
            setActiveTab("results");
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <UserLayout>
            <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-9">
                <div className="flex flex-wrap items-center justify-center gap-5 mb-6">
                    <button
                        onClick={() => setActiveTab("map")}
                        className={`flex items-center gap-2 rounded-full py-2 px-6 font-medium ${
                            activeTab === "map" 
                                ? "bg-primary text-white" 
                                : "bg-gray-2 text-gray-7 dark:bg-meta-4 dark:text-white"
                        }`}
                    >
                        🗺️ View Map
                    </button>

                    <button
                        onClick={() => selectedLocation && setActiveTab("results")}
                        disabled={!selectedLocation}
                        className={`flex items-center gap-2 rounded-full py-2 px-6 font-medium ${
                            activeTab === "results" 
                                ? "bg-primary text-white" 
                                : "bg-gray-2 text-gray-7 dark:bg-meta-4 dark:text-white"
                        } ${!selectedLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        📊 View Results
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : activeTab === "map" ? (
                    <div className="rounded-lg overflow-hidden border border-stroke dark:border-strokedark">
                        <NDVIMap 
                            onLocationSelect={handleLocationSelect} 
                            initialPosition={selectedLocation}
                        />
                    </div>
                ) : (
                    <div className="rounded-lg overflow-hidden">
                        {ndviData ? (
                            <NDVIResults data={ndviData} />
                        ) : (
                            <div className="text-center py-10">
                                <p>Aucune donnée NDVI disponible</p>
                                <button 
                                    onClick={() => setActiveTab("map")}
                                    className="mt-4 text-primary hover:underline"
                                >
                                    Sélectionnez une localisation
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
