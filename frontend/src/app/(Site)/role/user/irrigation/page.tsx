'use client';

import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import UserLayout from "@/components/Layouts/UserLayout";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Land {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

interface SoilMoistureResponse {
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    hourly_units: {
        [key: string]: string;
    };
    hourly: {
        time: string[];
        soil_moisture_0_to_1cm: number[];
        soil_moisture_1_to_3cm: number[];
        soil_moisture_3_to_9cm: number[];
        soil_moisture_9_to_27cm: number[];
        soil_moisture_27_to_81cm: number[];
        rain: number[];
    };
}

interface WeatherForecast {
    date: string;
    soilMoisture: number;
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
}

const IrrigationPage = () => {
    const [lands, setLands] = useState<Land[]>([]);
    const [selectedLand, setSelectedLand] = useState<Land | null>(null);
    const [activeTab, setActiveTab] = useState<'soil' | 'general'>('soil');
    const [soilData, setSoilData] = useState<SoilMoistureResponse | null>(null);
    const [generalData, setGeneralData] = useState<WeatherForecast[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Date filter states
    const [forecastDays, setForecastDays] = useState<number>(7);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [specificDate, setSpecificDate] = useState<string>('');
    const [filtersApplied, setFiltersApplied] = useState(false);

    // Fetch lands for the current user
    useEffect(() => {
        const fetchLands = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('idUtilisateur');

                if (!token || !userId) {
                    throw new Error('Authentication required');
                }

                const response = await fetch(`http://localhost:8080/api/lands/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch lands');
                }

                const data = await response.json();
                setLands(data);
                if (data.length > 0) {
                    setSelectedLand(data[0]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch lands');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLands();
    }, []);

    // Fetch soil data when land changes or soil tab is active
    useEffect(() => {
        if (!selectedLand || activeTab !== 'soil') return;

        const fetchSoilData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Authentication required');
                }

                const headers = {
                    'Authorization': `Bearer ${token}`
                };

                let soilParams = `latitude=${selectedLand.latitude}&longitude=${selectedLand.longitude}`;

                if (forecastDays) {
                    soilParams += `&forecastDays=${forecastDays}`;
                } else if (startDate && endDate) {
                    soilParams += `&startDate=${startDate}&endDate=${endDate}`;
                }

                const soilResponse = await fetch(
                    `http://localhost:8080/api/soilMoisture?${soilParams}`,
                    { headers }
                );

                if (!soilResponse.ok) {
                    throw new Error('Failed to fetch soil data');
                }

                const soilData = await soilResponse.json();
                setSoilData(soilData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch soil data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSoilData();
    }, [selectedLand, activeTab, forecastDays, startDate, endDate]);

    // Fetch general data only when filters are applied
    const fetchGeneralData = async () => {
        if (!selectedLand) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication required');
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            let generalParams = `latitude=${selectedLand.latitude}&longitude=${selectedLand.longitude}`;

            if (specificDate) {
                generalParams += `&date=${specificDate}`;
            } else if (startDate && endDate) {
                generalParams += `&startDate=${startDate}&endDate=${endDate}`;
            }

            const generalResponse = await fetch(
                `http://localhost:8080/api/soilMoisture/general?${generalParams}`,
                { headers }
            );

            if (!generalResponse.ok) {
                throw new Error('Failed to fetch general data');
            }

            const generalData = await generalResponse.json();
            setGeneralData(generalData);
            setFiltersApplied(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch general data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'general') {
            fetchGeneralData();
        }
    };

    const resetDateFilters = () => {
        setForecastDays(7);
        setStartDate('');
        setEndDate('');
        setSpecificDate('');
        setFiltersApplied(false);
        if (activeTab === 'general') {
            setGeneralData([]);
        }
    };

    // Soil moisture chart data
    const soilMoistureChartData = {
        labels: soilData?.hourly?.time.map(t => new Date(t).toLocaleTimeString()) || [],
        datasets: [
            {
                label: '0-1cm',
                data: soilData?.hourly?.soil_moisture_0_to_1cm || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
            },
            {
                label: '1-3cm',
                data: soilData?.hourly?.soil_moisture_1_to_3cm || [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.1
            },
            {
                label: '3-9cm',
                data: soilData?.hourly?.soil_moisture_3_to_9cm || [],
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                tension: 0.1
            },
            {
                label: '9-27cm',
                data: soilData?.hourly?.soil_moisture_9_to_27cm || [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1
            },
            {
                label: '27-81cm',
                data: soilData?.hourly?.soil_moisture_27_to_81cm || [],
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                tension: 0.1
            }
        ]
    };

    // Rain chart data
    const rainChartData = {
        labels: soilData?.hourly?.time.map(t => new Date(t).toLocaleTimeString()) || [],
        datasets: [{
            label: 'Rainfall',
            data: soilData?.hourly?.rain || [],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
    };

    // Temperature chart data
    const tempChartData = {
        labels: generalData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
            label: 'Temperature',
            data: generalData.map(d => d.temperature),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }]
    };

    // Humidity chart data
    const humidityChartData = {
        labels: generalData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
            label: 'Humidity',
            data: generalData.map(d => d.humidity),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
    };

    // Common chart options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    };

    return (
        <UserLayout>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Irrigation Dashboard</h1>

                    <div className="flex items-center space-x-4">
                        <div className="w-64">
                            <label htmlFor="land" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Land
                            </label>
                            <select
                                id="land"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={selectedLand?.id || ''}
                                onChange={(e) => {
                                    const land = lands.find(l => l.id.toString() === e.target.value);
                                    if (land) setSelectedLand(land);
                                }}
                                disabled={loading || lands.length === 0}
                            >
                                {lands.map(land => (
                                    <option key={land.id} value={land.id}>
                                        {land.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'soil' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('soil')}
                        >
                            Soil Moisture Details
                        </button>
                        <button
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'general' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('general')}
                        >
                            General Weather Info
                        </button>
                    </div>
                </div>

                {/* Date Filter Form */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Date Filters</h2>
                    <form onSubmit={handleDateFilterSubmit} className="space-y-4">
                        {activeTab === 'soil' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="forecastDays" className="block text-sm font-medium text-gray-700 mb-1">
                                        Forecast Days
                                    </label>
                                    <select
                                        id="forecastDays"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={forecastDays}
                                        onChange={(e) => {
                                            setForecastDays(Number(e.target.value));
                                            setStartDate('');
                                            setEndDate('');
                                            setSpecificDate('');
                                            setFiltersApplied(false);
                                        }}
                                    >
                                        <option value="1">1 Day</option>
                                        <option value="3">3 Days</option>
                                        <option value="7">7 Days</option>
                                        <option value="14">14 Days</option>
                                    </select>
                                </div>
                                <div className="flex items-end space-x-2">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setForecastDays(0);
                                                setSpecificDate('');
                                                setFiltersApplied(false);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={endDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setForecastDays(0);
                                                setSpecificDate('');
                                                setFiltersApplied(false);
                                            }}
                                            min={startDate}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="specificDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Specific Date
                                    </label>
                                    <input
                                        type="date"
                                        id="specificDate"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={specificDate}
                                        onChange={(e) => {
                                            setSpecificDate(e.target.value);
                                            setStartDate('');
                                            setEndDate('');
                                            setForecastDays(0);
                                            setFiltersApplied(false);
                                        }}
                                    />
                                </div>
                                <div className="flex items-end space-x-2">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setSpecificDate('');
                                                setForecastDays(0);
                                                setFiltersApplied(false);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={endDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setSpecificDate('');
                                                setForecastDays(0);
                                                setFiltersApplied(false);
                                            }}
                                            min={startDate}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={activeTab === 'general' && !specificDate && !(startDate && endDate)}
                            >
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                onClick={resetDateFilters}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'soil' && soilData && (
                            <div className="space-y-8">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Soil Moisture Levels</h2>
                                    <div className="h-96">
                                        <Line
                                            data={soilMoistureChartData}
                                            options={{
                                                ...chartOptions,
                                                plugins: {
                                                    ...chartOptions.plugins,
                                                    title: {
                                                        display: true,
                                                        text: 'Soil Moisture at Different Depths'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Rainfall</h2>
                                    <div className="h-96">
                                        <Bar
                                            data={rainChartData}
                                            options={{
                                                ...chartOptions,
                                                plugins: {
                                                    ...chartOptions.plugins,
                                                    title: {
                                                        display: true,
                                                        text: 'Rainfall'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'general' && (
                            <>
                                {!filtersApplied ? (
                                    <div className="bg-white p-6 rounded-lg shadow text-center py-12">
                                        <p className="text-gray-500">Please apply date filters to view weather data</p>
                                    </div>
                                ) : generalData.length > 0 ? (
                                    <div className="space-y-8">
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-lg font-medium text-gray-900 mb-4">Temperature</h2>
                                            <div className="h-96">
                                                <Line
                                                    data={tempChartData}
                                                    options={{
                                                        ...chartOptions,
                                                        plugins: {
                                                            ...chartOptions.plugins,
                                                            title: {
                                                                display: true,
                                                                text: 'Temperature (°C)'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-lg font-medium text-gray-900 mb-4">Humidity</h2>
                                            <div className="h-96">
                                                <Line
                                                    data={humidityChartData}
                                                    options={{
                                                        ...chartOptions,
                                                        plugins: {
                                                            ...chartOptions.plugins,
                                                            title: {
                                                                display: true,
                                                                text: 'Humidity (%)'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-lg font-medium text-gray-900 mb-4">Weather Summary</h2>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Moisture</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rainfall</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wind Speed</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                    {generalData.map((forecast) => (
                                                        <tr key={forecast.date}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(forecast.date).toLocaleDateString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{forecast.soilMoisture.toFixed(2)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{forecast.temperature.toFixed(2)}°C</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{forecast.humidity.toFixed(2)}%</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{forecast.rainfall.toFixed(2)}mm</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{forecast.windSpeed.toFixed(2)} km/h</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-6 rounded-lg shadow text-center py-12">
                                        <p className="text-gray-500">No weather data available for the selected filters</p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </UserLayout>
    );
};

export default IrrigationPage;