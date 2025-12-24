import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Location } from '../../types';
import L from 'leaflet';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const getColorByType = (type: string): string => {
    // Normalize type for matching (handle variations)
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('stele')) return '#fbbf24'; // amber
    if (normalizedType.includes('pillar')) return '#f97316'; // orange
    if (normalizedType.includes('deval')) return '#a855f7'; // purple
    if (normalizedType.includes('stupa')) return '#84cc16'; // lime
    if (normalizedType.includes('temple')) return '#ef4444'; // red
    if (normalizedType.includes('fountain')) return '#06b6d4'; // cyan
    if (normalizedType.includes('fort')) return '#92400e'; // brown
    if (normalizedType.includes('palace')) return '#dc2626'; // crimson
    if (normalizedType.includes('inscription')) return '#eab308'; // yellow
    if (normalizedType.includes('monastery') || normalizedType.includes('vihara')) return '#d946ef'; // fuchsia
    if (normalizedType.includes('remains')) return '#bc6c25'; // tan
    if (normalizedType.includes('museum')) return '#0ea5e9'; // sky

    return '#6b7280'; // gray
};

interface MapCanvasProps {
    locations: Location[];
    onLocationSelect: (loc: Location) => void;
}

export const MapCanvas = ({ locations, onLocationSelect }: MapCanvasProps) => {
    useEffect(() => {
        console.log('🗺️ Leaflet map initialized with', locations.length, 'historical sites');
    }, [locations]);

    // Filter out locations without coordinates
    const mappableLocations = locations.filter(loc => loc.coordinates !== null);

    return (
        <div className="w-full h-full">
            <MapContainer
                center={[28.8, 81.8]} // Center on western Nepal (Khasa Malla region)
                zoom={7}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ background: '#f0f0f0' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mappableLocations.map((location) => {
                    if (!location.coordinates) return null;

                    const color = getColorByType(location.type);

                    const customIcon = L.divIcon({
                        className: 'custom-marker',
                        html: `
                            <div style="
                                width: 16px;
                                height: 16px;
                                background-color: ${color};
                                border: 3px solid white;
                                border-radius: 50%;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                cursor: pointer;
                            "></div>
                        `,
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    });

                    return (
                        <Marker
                            key={location.id}
                            position={[location.coordinates.lat, location.coordinates.lng]}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => onLocationSelect(location)
                            }}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold">{location.name}</h3>
                                    <p className="text-sm">{location.type} • {location.region}</p>
                                    {location.entry_no && (
                                        <p className="text-xs text-gray-600">Entry: {location.entry_no}</p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
