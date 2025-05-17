"use client";
import AdminLayout from "@/components/Layouts/AdminLayout";
import { useState, useEffect } from 'react';

interface MoistureThreshold {
    lower: number;
    upper: number;
}

interface SoilType {
    name: string;
    multiplier: number;
}

interface CropType {
    id: number;
    name: string;
    baseWaterRequirement: number;
    maxDailyIrrigation: number;
    soilTypeAdjustment: SoilType;
    growthStageDurations: Record<string, number>;
    moistureThresholds: Record<string, MoistureThreshold>;
}

interface CreateCropRequest {
    name: string;
    baseWaterRequirement: number;
    maxDailyIrrigation: number;
    soilTypeAdjustment: string; // Just the name for backend
    growthStageDurations: Record<string, number>;
    moistureThresholds: Record<string, MoistureThreshold>;
}

interface UpdateCropRequest extends CreateCropRequest {
    id: number;
}

const soilTypes: SoilType[] = [
    { name: 'SANDY', multiplier: 1.3 },
    { name: 'LOAMY', multiplier: 1.0 },
    { name: 'CLAY', multiplier: 0.8 }
];

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

const CropPage = () => {
    const [crops, setCrops] = useState<CropType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCrop, setEditingCrop] = useState<CropType | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCrop, setNewCrop] = useState<Partial<CropType>>({
        name: '',
        baseWaterRequirement: 0,
        maxDailyIrrigation: 0,
        soilTypeAdjustment: { name: 'LOAMY', multiplier: 1.0 },
        growthStageDurations: {},
        moistureThresholds: {}
    });

    const fetchCrops = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/crops', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch crops');
            }

            const data = await response.json();
            setCrops(data);
            setLoading(false);
        } catch (err) {
            if (isError(err)) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while fetching crops');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrops();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this crop?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/crops/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete crop');
            }

            fetchCrops();
        } catch (err) {
            if (isError(err)) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while deleting crop');
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCrop) return;

        try {
            const cropToSend: UpdateCropRequest = {
                id: editingCrop.id,
                name: editingCrop.name,
                baseWaterRequirement: editingCrop.baseWaterRequirement,
                maxDailyIrrigation: editingCrop.maxDailyIrrigation,
                soilTypeAdjustment: editingCrop.soilTypeAdjustment.name,
                growthStageDurations: editingCrop.growthStageDurations,
                moistureThresholds: editingCrop.moistureThresholds
            };

            const response = await fetch(`http://localhost:8080/api/admin/crops/${editingCrop.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(cropToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update crop');
            }

            setEditingCrop(null);
            fetchCrops();
        } catch (err) {
            if (isError(err)) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while updating crop');
            }
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!newCrop.name || !newCrop.soilTypeAdjustment) {
                throw new Error('Missing required fields');
            }

            const cropToSend: CreateCropRequest = {
                name: newCrop.name,
                baseWaterRequirement: newCrop.baseWaterRequirement || 0,
                maxDailyIrrigation: newCrop.maxDailyIrrigation || 0,
                soilTypeAdjustment: newCrop.soilTypeAdjustment.name,
                growthStageDurations: newCrop.growthStageDurations || {},
                moistureThresholds: newCrop.moistureThresholds || {}
            };

            const response = await fetch('http://localhost:8080/api/admin/crops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(cropToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create crop');
            }

            setIsCreateModalOpen(false);
            setNewCrop({
                name: '',
                baseWaterRequirement: 0,
                maxDailyIrrigation: 0,
                soilTypeAdjustment: { name: 'LOAMY', multiplier: 1.0 },
                growthStageDurations: {},
                moistureThresholds: {}
            });
            fetchCrops();
        } catch (err) {
            if (isError(err)) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while creating crop');
            }
        }
    };

    const addGrowthStage = () => {
        const stageName = prompt('Enter growth stage name:');
        if (!stageName) return;

        const duration = parseInt(prompt('Enter duration in days:') || '0');
        const lowerThreshold = parseFloat(prompt('Enter lower moisture threshold:') || '0');
        const upperThreshold = parseFloat(prompt('Enter upper moisture threshold:') || '0');

        if (editingCrop) {
            setEditingCrop({
                ...editingCrop,
                growthStageDurations: {
                    ...editingCrop.growthStageDurations,
                    [stageName]: duration
                },
                moistureThresholds: {
                    ...editingCrop.moistureThresholds,
                    [stageName]: { lower: lowerThreshold, upper: upperThreshold }
                }
            });
        } else if (isCreateModalOpen) {
            setNewCrop({
                ...newCrop,
                growthStageDurations: {
                    ...(newCrop.growthStageDurations || {}),
                    [stageName]: duration
                },
                moistureThresholds: {
                    ...(newCrop.moistureThresholds || {}),
                    [stageName]: { lower: lowerThreshold, upper: upperThreshold }
                }
            });
        }
    };

    const removeGrowthStage = (stageName: string) => {
        if (editingCrop) {
            const { [stageName]: _, ...remainingDurations } = editingCrop.growthStageDurations;
            const { [stageName]: __, ...remainingThresholds } = editingCrop.moistureThresholds;

            setEditingCrop({
                ...editingCrop,
                growthStageDurations: remainingDurations,
                moistureThresholds: remainingThresholds
            });
        } else if (isCreateModalOpen) {
            const { [stageName]: _, ...remainingDurations } = newCrop.growthStageDurations || {};
            const { [stageName]: __, ...remainingThresholds } = newCrop.moistureThresholds || {};

            setNewCrop({
                ...newCrop,
                growthStageDurations: remainingDurations,
                moistureThresholds: remainingThresholds
            });
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Crop Management</h1>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    >
                        Add New Crop
                    </button>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water Req. (mm/day)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Irrigation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {crops.map((crop) => (
                            <tr key={crop.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{crop.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.baseWaterRequirement}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.maxDailyIrrigation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {crop.soilTypeAdjustment?.name} (x{crop.soilTypeAdjustment?.multiplier})
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setEditingCrop(crop)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(crop.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Edit Modal */}
                {editingCrop && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Edit Crop</h3>
                                <button
                                    onClick={() => setEditingCrop(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Crop Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={editingCrop.name}
                                            onChange={(e) => setEditingCrop({...editingCrop, name: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="soilType" className="block text-sm font-medium text-gray-700">
                                            Soil Type
                                        </label>
                                        <select
                                            id="soilType"
                                            name="soilType"
                                            value={editingCrop.soilTypeAdjustment?.name}
                                            onChange={(e) => {
                                                const selectedSoil = soilTypes.find(s => s.name === e.target.value);
                                                if (selectedSoil) {
                                                    setEditingCrop({
                                                        ...editingCrop,
                                                        soilTypeAdjustment: selectedSoil
                                                    });
                                                }
                                            }}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        >
                                            {soilTypes.map((soil) => (
                                                <option key={soil.name} value={soil.name}>
                                                    {soil.name} (x{soil.multiplier})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="baseWater" className="block text-sm font-medium text-gray-700">
                                            Base Water Requirement (mm/day)
                                        </label>
                                        <input
                                            type="number"
                                            name="baseWater"
                                            id="baseWater"
                                            step="0.1"
                                            min="0"
                                            value={editingCrop.baseWaterRequirement}
                                            onChange={(e) => setEditingCrop({...editingCrop, baseWaterRequirement: parseFloat(e.target.value)})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="maxIrrigation" className="block text-sm font-medium text-gray-700">
                                            Max Daily Irrigation (mm/day)
                                        </label>
                                        <input
                                            type="number"
                                            name="maxIrrigation"
                                            id="maxIrrigation"
                                            step="0.1"
                                            min="0"
                                            value={editingCrop.maxDailyIrrigation}
                                            onChange={(e) => setEditingCrop({...editingCrop, maxDailyIrrigation: parseFloat(e.target.value)})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Growth Stages
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addGrowthStage}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Add Stage
                                            </button>
                                        </div>
                                        <div className="mt-2 space-y-2">
                                            {Object.entries(editingCrop.growthStageDurations).map(([stage, duration]) => (
                                                <div key={stage} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div className="flex-1">
                                                        <span className="font-medium">{stage}</span>:
                                                        <span className="ml-2">{duration} days</span>
                                                        <span className="ml-4">Moisture: {editingCrop.moistureThresholds[stage]?.lower}% - {editingCrop.moistureThresholds[stage]?.upper}%</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGrowthStage(stage)}
                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                            {Object.keys(editingCrop.growthStageDurations).length === 0 && (
                                                <p className="text-sm text-gray-500">No growth stages added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCrop(null)}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Create New Crop</h3>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="newName" className="block text-sm font-medium text-gray-700">
                                            Crop Name
                                        </label>
                                        <input
                                            type="text"
                                            name="newName"
                                            id="newName"
                                            value={newCrop.name || ''}
                                            onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="newSoilType" className="block text-sm font-medium text-gray-700">
                                            Soil Type
                                        </label>
                                        <select
                                            id="newSoilType"
                                            name="newSoilType"
                                            value={newCrop.soilTypeAdjustment?.name || 'LOAMY'}
                                            onChange={(e) => {
                                                const selectedSoil = soilTypes.find(s => s.name === e.target.value);
                                                if (selectedSoil) {
                                                    setNewCrop({
                                                        ...newCrop,
                                                        soilTypeAdjustment: selectedSoil
                                                    });
                                                }
                                            }}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        >
                                            {soilTypes.map((soil) => (
                                                <option key={soil.name} value={soil.name}>
                                                    {soil.name} (x{soil.multiplier})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="newBaseWater" className="block text-sm font-medium text-gray-700">
                                            Base Water Requirement (mm/day)
                                        </label>
                                        <input
                                            type="number"
                                            name="newBaseWater"
                                            id="newBaseWater"
                                            step="0.1"
                                            min="0"
                                            value={newCrop.baseWaterRequirement || 0}
                                            onChange={(e) => setNewCrop({...newCrop, baseWaterRequirement: parseFloat(e.target.value)})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="newMaxIrrigation" className="block text-sm font-medium text-gray-700">
                                            Max Daily Irrigation (mm/day)
                                        </label>
                                        <input
                                            type="number"
                                            name="newMaxIrrigation"
                                            id="newMaxIrrigation"
                                            step="0.1"
                                            min="0"
                                            value={newCrop.maxDailyIrrigation || 0}
                                            onChange={(e) => setNewCrop({...newCrop, maxDailyIrrigation: parseFloat(e.target.value)})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Growth Stages
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addGrowthStage}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Add Stage
                                            </button>
                                        </div>
                                        <div className="mt-2 space-y-2">
                                            {newCrop.growthStageDurations && Object.entries(newCrop.growthStageDurations).map(([stage, duration]) => (
                                                <div key={stage} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div className="flex-1">
                                                        <span className="font-medium">{stage}</span>:
                                                        <span className="ml-2">{duration} days</span>
                                                        <span className="ml-4">Moisture: {newCrop.moistureThresholds?.[stage]?.lower}% - {newCrop.moistureThresholds?.[stage]?.upper}%</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGrowthStage(stage)}
                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                            {(!newCrop.growthStageDurations || Object.keys(newCrop.growthStageDurations).length === 0) && (
                                                <p className="text-sm text-gray-500">No growth stages added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CropPage;