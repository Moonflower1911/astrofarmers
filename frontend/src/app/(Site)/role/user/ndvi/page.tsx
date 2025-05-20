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
            const response = await fetch('http://localhost:8080/ndvi/from-coords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latitude: lat, longitude: lng }),
            });

            if (!response.ok) {
                throw new Error('Error fetching NDVI data');
            }

            // Handle both JSON and text responses
            let data;
            const responseText = await response.text();

            try {
                data = JSON.parse(responseText);
            } catch (e) {
                // If not valid JSON, parse as text
                data = parseTextResponse(responseText);
            }

            // Normalize the data structure
            const normalizedData = normalizeData(data);

            setNdviData(normalizedData);
            setActiveTab("results");
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to get NDVI data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to parse text responses
    const parseTextResponse = (text: string): any => {
        const result: any = {
            stats: { min: 0, max: 0, mean: 0 },
            interpretation: "",
            imagePath: "",
            ndviValues: []
        };

        // Parse stats
        const statsMatch = text.match(/min: ([\d.]+), max: ([\d.]+), mean: ([\d.]+)/);
        if (statsMatch) {
            result.stats = {
                min: parseFloat(statsMatch[1]),
                max: parseFloat(statsMatch[2]),
                mean: parseFloat(statsMatch[3])
            };
        }

        // Parse interpretation
        const interpretationMatch = text.match(/Interpretation: (.+)/);
        if (interpretationMatch) result.interpretation = interpretationMatch[1];

        // Parse image path
        const imageMatch = text.match(/Image NDVI: (.+)/);
        if (imageMatch) result.imagePath = imageMatch[1];

        // Parse NDVI values
        const valuesMatch = text.match(/NDVI_VALUES=\[([\d., ]+)\]/);
        if (valuesMatch) {
            result.ndviValues = valuesMatch[1].split(',').map(parseFloat);
        }

        return result;
    };

    // Helper function to normalize data structure
    const normalizeData = (data: any) => {
        // Extract min, max, mean from stats string if needed
        if (typeof data.stats === 'string') {
            const statsMatch = data.stats.match(/min:\s*([\d.]+),?\s*max:\s*([\d.]+),?\s*mean:\s*([\d.]+)/i);
            if (statsMatch) {
                data.stats = {
                    min: parseFloat(statsMatch[1]),
                    max: parseFloat(statsMatch[2]),
                    mean: parseFloat(statsMatch[3]),
                };
            } else {
                data.stats = { min: 0, max: 0, mean: 0 };
            }
        }

        // Ensure ndviValues is an array
        if (!Array.isArray(data.ndviValues)) {
            data.ndviValues = [];
        }

        return {
            stats: data.stats,
            interpretation: data.interpretation || "No interpretation available",
            imagePath: data.imagePath || "",
            ndviValues: data.ndviValues,
        };
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
                                <p>No NDVI data available</p>
                                <button
                                    onClick={() => setActiveTab("map")}
                                    className="mt-4 text-primary hover:underline"
                                >
                                    Select a location first
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}