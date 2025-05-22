"use client";

import { useEffect, useState } from "react";
import UserLayout from "@/components/Layouts/UserLayout";

import {
    WiDaySunny,
    WiNightClear,
    WiRain,
    WiShowers,
    WiDayCloudy,
    WiNightAltCloudy,
    WiCloud,
} from "react-icons/wi";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";


interface Land {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

interface DailyForecast {
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    sunrise: string;
    sunset: string;
    precipitationSum: number;
    uvIndexMax: number;
    windSpeedMax: number;
    radiationSum: number;
}

interface Forecast {
    id: string;
    temperature: number;
    precipitation: number;
    radiation: number;
    windSpeed: number;
    windDirection: number;
    cloudCover: number;
    source: string;
    latitude: number;
    longitude: number;
    dateTime: string;
}

interface Alert {
    id: string;
    type: string;
    message: string;
    latitude: number;
    longitude: number;
    timestamp: string;
}

// --- Constants ---

const UserPage = () => {
    const [forecasts, setForecasts] = useState<Forecast[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const cardsToShow = 4;

    const next = () => {
        if (currentIndex + cardsToShow < filtered.length) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    const [lands, setLands] = useState<Land[]>([]);
    const [selectedLand, setSelectedLand] = useState<Land | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLands = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("idUtilisateur");

                if (!token || !userId) throw new Error("Authentication required");

                const res = await fetch(`http://localhost:8080/api/lands/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch lands");

                const data = await res.json();
                setLands(data);
                if (data.length > 0) setSelectedLand(data[0]); // auto-select first land
            } catch (err: any) {
                setError(err.message || "Failed to load lands");
            } finally {
                setLoading(false);
            }
        };

        fetchLands();
    }, []);


    const [daily, setDaily] = useState<DailyForecast | null>(null);

    useEffect(() => {
        if (!selectedLand) return;
        fetch(`http://localhost:8080/api/weather/daily?lat=${selectedLand.latitude}&lon=${selectedLand.longitude}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setDaily(data[0]);
            })
            .catch((err) => console.error("Failed to fetch daily forecast", err));
    }, [selectedLand]);

    useEffect(() => {
        if (!selectedLand) return;
        fetch(`http://localhost:8080/api/weather/forecast?lat=${selectedLand.latitude}&lon=${selectedLand.longitude}`)
            .then((res) => res.json())
            .then((data) => setForecasts(data))
            .catch((err) => console.error("Failed to fetch forecast", err));
    }, [selectedLand]);

    useEffect(() => {
        if (!selectedLand) return;
        fetch(`http://localhost:8080/api/alerts?lat=${selectedLand.latitude}&lon=${selectedLand.longitude}`)
            .then((res) => res.json())
            .then((data) => setAlerts(data))
            .catch((err) => console.error("Failed to fetch alerts", err));
    }, [selectedLand]);


    const filtered = forecasts.filter((f) =>
        f.dateTime.startsWith(selectedDate)
    );

    const todayStr = new Date().toISOString().split("T")[0];
    const maxStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // Historical Data States
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedMetric, setSelectedMetric] = useState("temperatureMax");
    const [historicalData, setHistoricalData] = useState<any[]>([]);


    const fetchHistoricalData = async () => {
        if (!startDate || !endDate || !selectedLand) return;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const promises = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            const url = `http://localhost:8080/api/weather/historical?lat=${selectedLand.latitude}&lon=${selectedLand.longitude}&date=${dateStr}`;

            promises.push(fetch(url).then((res) => res.json()));
        }

        try {
            const results = await Promise.all(promises);
            setHistoricalData(results);
        } catch (err) {
            console.error("Failed to fetch historical data", err);
        }
    };


    return (
        <UserLayout>
            {lands.length > 0 && (
                <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 dark:text-white mr-4">Select Land:</label>
                    <select
                        value={selectedLand?.id}
                        onChange={(e) => {
                            const selected = lands.find((land) => land.id === parseInt(e.target.value));
                            if (selected) setSelectedLand(selected);
                        }}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white border dark:border-gray-500"
                    >
                        {lands.map((land) => (
                            <option key={land.id} value={land.id}>
                                {land.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="mx-auto max-w-7xl px-4 py-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                        <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z" />
                        <path d="M5 12a1 1 0 100 2 3 3 0 013 3 1 1 0 102 0 5 5 0 00-5-5z" />
                        <path d="M9 16a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    WEATHER FORECAST
                </h1>

                {daily && (
                    <div className="w-full max-w-5xl mx-auto mb-8 p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        {/* Date and Time Header */}
                        <div className="text-center mb-8">
                            <p className="text-xl text-gray-700 dark:text-gray-200 font-semibold tracking-wider">
                                {new Date(daily.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })} | {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12">
                            {/* Left Block: Weather Icon and Temperature */}
                            <div className="flex flex-col items-center lg:items-start gap-8 w-full lg:w-auto">
                                {/* Large Weather Icon with Temperature */}
                                <div className="flex items-center gap-8">
                                    <div className="relative">
                                        <WiDaySunny className="text-yellow-400 dark:text-yellow-300 text-[8rem] md:text-[9rem] transform transition-all duration-500 hover:scale-110 hover:rotate-12" />
                                        <div className="absolute -bottom-2 -right-4 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">DAY</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-2xl text-gray-600 dark:text-gray-300 capitalize font-medium">Mist</p>
                                    </div>
                                </div>

                                {/* Temperature Range */}
                                <div className="flex gap-6 w-full justify-center lg:justify-start">
                                    <div className="text-center px-6 py-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 shadow-sm border border-orange-100 dark:border-orange-800/50">
                                        <p className="text-sm text-orange-600 dark:text-orange-300 font-medium">High</p>
                                        <p className="text-2xl text-orange-600 dark:text-orange-300 font-bold">{daily.temperatureMax}°</p>
                                    </div>
                                    <div className="text-center px-6 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-sm border border-blue-100 dark:border-blue-800/50">
                                        <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Low</p>
                                        <p className="text-2xl text-blue-600 dark:text-blue-300 font-bold">{daily.temperatureMin}°</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Block: Weather Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 w-full max-w-2xl">
                                {[
                                    {
                                        label: "Precipitation",
                                        value: `${daily.precipitationSum} mm`,
                                        icon: "💧",
                                        bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
                                        border: "border-blue-100 dark:border-blue-800/30"
                                    },
                                    {
                                        label: "Wind Speed",
                                        value: `${daily.windSpeedMax} km/h`,
                                        icon: "💨",
                                        bg: "from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800",
                                        border: "border-gray-200 dark:border-gray-700"
                                    },
                                    {
                                        label: "Wind Direction",
                                        value: "NE",
                                        icon: "🧭",
                                        bg: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
                                        border: "border-purple-100 dark:border-purple-800/30"
                                    },
                                    {
                                        label: "Cloud Cover",
                                        value: `${Math.round((daily.radiationSum || 0) / 100)}%`,
                                        icon: "☁️",
                                        bg: "from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700",
                                        border: "border-gray-300 dark:border-gray-600"
                                    },
                                    {
                                        label: "Sunrise",
                                        value: new Date(daily.sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                        icon: "🌅",
                                        bg: "from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
                                        border: "border-amber-100 dark:border-amber-800/30"
                                    },
                                    {
                                        label: "Sunset",
                                        value: new Date(daily.sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                        icon: "🌇",
                                        bg: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
                                        border: "border-orange-100 dark:border-orange-800/30"
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl bg-gradient-to-br ${item.bg} border ${item.border} transition-all duration-300 hover:scale-105 shadow-sm text-center flex flex-col items-center justify-between h-full`}
                                    >
                                        <p className="text-4xl mb-3">{item.icon}</p>
                                        <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{item.value}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}



                {/* Forecast Section */}
                <div className="mt-8 p-6 rounded-xl transition-colors duration-300">
                    {/* Date Picker */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative w-full max-w-md">
                            {/* Date Input */}
                            <input
                                type="date"
                                value={selectedDate}
                                min={todayStr}
                                max={maxStr}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-50 text-gray-800 dark:text-gray-900 font-medium border border-gray-200 dark:border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all duration-200 hover:shadow-lg text-center"
                            />


                            {/* Calendar Icon */}
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>


                    {/* Forecast Cards */}
                    {filtered.length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                            <p className="text-white/70 dark:text-gray-500 italic">
                                No forecast data available for this date
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 w-full flex justify-center items-center gap-4">
                            {/* Left Arrow */}
                            <button
                                onClick={prev}
                                disabled={currentIndex === 0}
                                className="bg-blue-600 hover:bg-blue-700 shadow-lg p-3 rounded-full hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Previous forecast"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white dark:text-gray-100" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            {/* Cards */}
                            <div className="flex space-x-4 overflow-hidden px-4 py-4">
                                {filtered.slice(currentIndex, currentIndex + cardsToShow).map((forecast) => {
                                    const hour = new Date(forecast.dateTime).getHours();
                                    const icon = getWeatherIconComponent(hour, forecast.cloudCover, forecast.precipitation);
                                    const timeStr = new Date(forecast.dateTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });

                                    const forecastDate = new Date(forecast.dateTime);
                                    const alertMatch = alerts.find((a) => {
                                        const alertDate = new Date(a.timestamp);
                                        return (
                                            alertDate.getHours() === forecastDate.getHours() &&
                                            alertDate.toDateString() === forecastDate.toDateString()
                                        );
                                    });

                                    return (
                                        <div
                                            key={forecast.id}
                                            className="flex-shrink-0 w-48 bg-white/90 dark:bg-gray-50 rounded-xl shadow-lg p-4 flex flex-col items-center text-center border border-white/20 dark:border-gray-200 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-200 relative"
                                        >
                                            {/* Alert Icon */}
                                            {alertMatch && (
                                                <div className="absolute top-2 right-2 group cursor-pointer">
                                                    <div className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-sm shadow-md">!</div>
                                                    <div className="absolute top-6 right-0 w-48 z-50 hidden group-hover:block bg-white dark:bg-gray-100 text-gray-800 dark:text-gray-900 text-sm p-2 rounded-md shadow-lg border border-gray-300 dark:border-gray-400">
                                                        <strong>{alertMatch.type}</strong>
                                                        <br />
                                                        {alertMatch.message}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-base font-semibold text-gray-700 dark:text-gray-800">{timeStr}</div>
                                            <div className="my-3 scale-[1.5]">{icon}</div>
                                            <div className="text-3xl font-bold text-gray-800 dark:text-gray-900">{forecast.temperature}°</div>

                                            <div className="w-full mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-700">
                                                <div className="flex justify-center items-center gap-2">
                                                    <span className="text-blue-500 text-lg">☂</span>
                                                    <span>{forecast.precipitation}% precipitation</span>
                                                </div>
                                                <div className="flex justify-center items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5 9a7 7 0 0111.95 4.95l1.414-1.414A9 9 0 005 7v2z" clipRule="evenodd" />
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{Math.round(forecast.windSpeed)} km/h winds</span>
                                                </div>
                                                <div className="flex justify-center items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{getWindDirectionLabel(forecast.windDirection)}</span>
                                                </div>
                                                <div className="flex justify-center items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                                                    </svg>
                                                    <span>{forecast.cloudCover}% cloud cover</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={next}
                                disabled={currentIndex + cardsToShow >= filtered.length}
                                className="bg-blue-600 hover:bg-blue-700 shadow-lg p-3 rounded-full hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Next forecast"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white dark:text-gray-100" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                </div>


                {/* Historical Data Section */}
                <div className="mt-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        HISTORICAL WEATHER ANALYSIS
                    </h1>

                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-white dark:to-gray-100 p-6 rounded-xl shadow-lg transition-colors duration-300 hover:shadow-xl">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-6">
                            {/* Start Date */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-white dark:text-gray-800 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    max={todayStr}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-white/90 dark:bg-gray-100 border border-white/30 dark:border-gray-300 px-4 py-2.5 rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* End Date */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-white dark:text-gray-800 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    max={todayStr}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-white/90 dark:bg-gray-100 border border-white/30 dark:border-gray-300 px-4 py-2.5 rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Metric Selector */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-white dark:text-gray-800 mb-2">Weather Metric</label>
                                <select
                                    value={selectedMetric}
                                    onChange={(e) => setSelectedMetric(e.target.value)}
                                    className="w-full bg-white/90 dark:bg-gray-100 border border-white/30 dark:border-gray-300 px-4 py-2.5 rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="temperatureMax">Max Temperature (°C)</option>
                                    <option value="temperatureMin">Min Temperature (°C)</option>
                                    <option value="precipitation">Precipitation (mm)</option>
                                    <option value="radiation">Solar Radiation (W/m²)</option>
                                    <option value="windSpeed">Wind Speed (km/h)</option>
                                    <option value="cloudCover">Cloud Cover (%)</option>
                                </select>
                            </div>

                            {/* Load Button */}
                            <button
                                onClick={fetchHistoricalData}
                                className="flex-1 lg:flex-none bg-white/90 hover:bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                Generate Report
                            </button>
                        </div>

                        {/* Chart Area */}
                        {historicalData.length > 0 ? (
                            <div className="h-96 w-full bg-white dark:bg-gray-100 rounded-xl p-6 shadow-inner">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={historicalData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: '#6b7280' }}
                                            tickMargin={10}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis
                                            tick={{ fill: '#6b7280' }}
                                            tickMargin={10}
                                            tickFormatter={(value) => `${value}${selectedMetric.includes('temperature') ? '°' : selectedMetric === 'precipitation' ? 'mm' : selectedMetric === 'windSpeed' ? 'km/h' : selectedMetric === 'cloudCover' ? '%' : ''}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(255,255,255,0.95)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                                color: '#111827'
                                            }}
                                            labelFormatter={(value) =>
                                                `${new Date(value).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}`
                                            }
                                            formatter={(value: number, rawName: string | number) => {
                                                const name = String(rawName) as keyof typeof units;

                                                const units = {
                                                    temperatureMax: '°C',
                                                    temperatureMin: '°C',
                                                    precipitation: 'mm',
                                                    radiation: 'W/m²',
                                                    windSpeed: 'km/h',
                                                    cloudCover: '%',
                                                };

                                                const labels = {
                                                    temperatureMax: 'Max Temp',
                                                    temperatureMin: 'Min Temp',
                                                    precipitation: 'Precipitation',
                                                    radiation: 'Radiation',
                                                    windSpeed: 'Wind Speed',
                                                    cloudCover: 'Cloud Cover',
                                                };

                                                const unit = units[name] ?? '';
                                                const label = labels[name] ?? name;

                                                return [`${value} ${unit}`, label];
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={selectedMetric}
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                            activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-white/90 dark:bg-gray-100 rounded-xl mt-6 border border-dashed border-gray-300 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-600 mb-1">No Data Available</h3>
                                <p className="text-gray-500 text-sm">Please select a valid date range and metric to generate the report.</p>
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </UserLayout>
    );
};

// Wind direction label helper
function getWindDirectionLabel(degrees: number) {
    const directions = [
        "Nord", "Nord-est", "Est", "Sud-est", "Sud", "Sud-ouest", "Ouest", "Nord-ouest"
    ];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// Icon helper
function getWeatherIconComponent(hour: number, cloudCover: number, precipitation: number) {
    const isDay = hour >= 6 && hour <= 18;
    if (precipitation > 5) return <WiRain className="text-4xl text-blue-500" />;
    if (precipitation > 0) return <WiShowers className="text-4xl text-blue-400" />;
    if (cloudCover > 80) return isDay
        ? <WiCloud className="text-4xl text-gray-400" />
        : <WiNightAltCloudy className="text-4xl text-gray-500" />;
    if (cloudCover > 40) return isDay
        ? <WiDayCloudy className="text-4xl text-yellow-400" />
        : <WiNightAltCloudy className="text-4xl text-indigo-300" />;
    return isDay
        ? <WiDaySunny className="text-4xl text-yellow-400" />
        : <WiNightClear className="text-4xl text-blue-200" />;
}

export default UserPage;