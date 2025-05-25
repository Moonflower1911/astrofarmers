'use client';

import { useState, useEffect } from 'react';
import UserLayout from "@/components/Layouts/UserLayout";

interface Land {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

interface CropType {
    id: number;
    name: string;
    waterRequirements: number;
    growthPeriod: number;
}

interface IrrigationSchedule {
    id: number;
    date: string;
    irrigationAmount: number;
    cropType: CropType;
    weatherForecast: {
        temperature: number;
        humidity: number;
        rainfall: number;
    };
}

interface IrrigationEvent {
    id: number;
    eventDate: string;
    irrigationAmount: number;
    done: boolean;
}

const SchedulesPage = () => {
    const [lands, setLands] = useState<Land[]>([]);
    const [selectedLand, setSelectedLand] = useState<Land | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
    const [cropTypes, setCropTypes] = useState<CropType[]>([]);
    const [events, setEvents] = useState<IrrigationEvent[]>([]);
    const [filterDone, setFilterDone] = useState<'all' | 'done' | 'pending'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    // Form states
    const [selectedCropType, setSelectedCropType] = useState<number | null>(null);
    const [plantingDate, setPlantingDate] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Fetch lands, crop types, and irrigation events
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('idUtilisateur');

                if (!token || !userId) {
                    throw new Error('Authentication required');
                }

                // Fetch lands
                const landsResponse = await fetch(`/api/lands/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!landsResponse.ok) {
                    throw new Error('Failed to fetch lands');
                }

                const landsData = await landsResponse.json();
                setLands(landsData);
                if (landsData.length > 0) {
                    setSelectedLand(landsData[0]);
                }

                // Fetch crop types
                const cropTypesResponse = await fetch(`/api/admin/crops`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!cropTypesResponse.ok) {
                    throw new Error('Failed to fetch crop types');
                }

                const cropTypesData = await cropTypesResponse.json();
                setCropTypes(cropTypesData);

                // Fetch irrigation events
                await fetchIrrigationEvents(userId, token);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch initial data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchIrrigationEvents = async (userId: string, token: string) => {
        try {
            const response = await fetch(`/api/irrigationEvents/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch irrigation events');
            }

            const data = await response.json();
            setEvents(data);
            setTotalPages(Math.ceil(data.length / itemsPerPage));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch irrigation events');
            console.error(err);
        }
    };

    const markEventAsDone = async (eventId: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('idUtilisateur');

            if (!token || !userId) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/irrigationEvents/${eventId}/done`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark event as done');
            }

            const updatedEvent = await response.json();
            setEvents(events.map(event =>
                event.id === eventId ? { ...event, done: updatedEvent.done } : event
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark event as done');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLand || !selectedCropType || !plantingDate || !startDate || !endDate) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('idUtilisateur');

            if (!token || !userId) {
                throw new Error('Authentication required');
            }

            const queryParams = new URLSearchParams({
                cropType: String(selectedCropType),
                plantingDate: String(plantingDate),
                startDate: String(startDate),
                endDate: String(endDate),
                latitude: String(selectedLand.latitude),
                longitude: String(selectedLand.longitude)
            }).toString();

            const response = await fetch(`/api/user/irrigation/${userId}/schedule?${queryParams}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate schedule');
            }

            const data = await response.json();
            setSchedules(data);
            // Refresh events after generating new schedule
            await fetchIrrigationEvents(userId, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate schedule');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter and paginate events
    const filteredEvents = events.filter(event => {
        if (filterDone === 'all') return true;
        if (filterDone === 'done') return event.done;
        return !event.done;
    });

    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <UserLayout>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Irrigation Management</h1>

                    <div className="flex items-center space-x-4">
                        <div className="w-64">
                            <label htmlFor="land" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Land
                            </label>
                            <select
                                id="land"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border--500 focus:ring-green-500 sm:text-sm"
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

                {/* Schedule Generation Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Generate New Schedule</h2>
                    <form onSubmit={generateSchedule} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Crop Type
                                </label>
                                <select
                                    id="cropType"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    value={selectedCropType || ''}
                                    onChange={(e) => setSelectedCropType(Number(e.target.value))}
                                    required
                                >
                                    <option value="">Select a crop</option>
                                    {cropTypes.map(crop => (
                                        <option key={crop.id} value={crop.id}>
                                            {crop.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Planting Date
                                </label>
                                <input
                                    type="date"
                                    id="plantingDate"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    value={plantingDate}
                                    onChange={(e) => setPlantingDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Schedule Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Schedule End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                disabled={loading || !selectedLand || !selectedCropType || !plantingDate || !startDate || !endDate}
                            >
                                {loading ? 'Generating...' : 'Generate Schedule'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Schedules List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : schedules.length > 0 ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Irrigation Schedule for {selectedLand?.name}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Water Amount (mm)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Weather
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Temperature (°C)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rainfall (mm)
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {new Date(schedule.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {schedule.irrigationAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {schedule.weatherForecast.rainfall > 0 ? 'Rainy' : 'Dry'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {schedule.weatherForecast.temperature.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {schedule.weatherForecast.rainfall.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow text-center py-12 mb-8">
                        <p className="text-gray-500">
                            {selectedLand
                                ? "Generate a new irrigation schedule using the form above"
                                : "Please select a land to generate irrigation schedules"}
                        </p>
                    </div>
                )}

                {/* Irrigation Events List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Irrigation Events
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Your scheduled irrigation tasks
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div>
                                <label htmlFor="filter" className="sr-only">Filter</label>
                                <select
                                    id="filter"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                    value={filterDone}
                                    onChange={(e) => {
                                        setFilterDone(e.target.value as 'all' | 'done' | 'pending');
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Events</option>
                                    <option value="done">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Water Amount (mm)
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedEvents.length > 0 ? (
                                paginatedEvents.map((event) => (
                                    <tr key={event.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {new Date(event.eventDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {event.irrigationAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.done ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {event.done ? 'Completed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {!event.done && (
                                                <button
                                                    onClick={() => markEventAsDone(event.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    disabled={loading}
                                                >
                                                    Mark as Done
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No irrigation events found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    {filteredEvents.length > itemsPerPage && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredEvents.length)}</span> of{' '}
                                        <span className="font-medium">{filteredEvents.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
};

export default SchedulesPage;