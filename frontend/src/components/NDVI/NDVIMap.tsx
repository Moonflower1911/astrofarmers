'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({ 
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface NDVIMapProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialPosition?: { lat: number; lng: number } | null;
}

function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? (
        <Marker position={position} icon={icon}>
            <Popup>
                Position sélectionnée: <br />
                Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
            </Popup>
        </Marker>
    ) : null;
}

export default function NDVIMap({ onLocationSelect, initialPosition }: NDVIMapProps) {
    const mapRef = useRef(null);

    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
        });
    }, []);

    return (
        <div className="h-[500px] w-full">
            <MapContainer 
                center={initialPosition || { lat: 45.612, lng: 5.1213 }} 
                zoom={initialPosition ? 15 : 13} 
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker onSelect={onLocationSelect} />
            </MapContainer>
        </div>
    );
}
