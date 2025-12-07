import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Location, LocationType } from '../../types';
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

const getColorByType = (type: LocationType): string => {
    switch (type) {
        case 'Peak': return '#f97316';
        case 'Valley': return '#22c55e';
        case 'Lake': return '#0ea5e9';
        case 'Monastery': return '#a855f7';
        case 'Village': return '#eab308';
        case 'Route/Trek': return '#3b82f6';
        case 'Glacier': return '#06b6d4';
        case 'Basecamp': return '#ef4444';
        default: return '#6b7280';
    }
};

interface MapCanvasProps {
    locations: Location[];
    onLocationSelect: (loc: Location) => void;
}

export const MapCanvas = ({ locations, onLocationSelect }: MapCanvasProps) => {
    useEffect(() => {
        console.log('🗺️ Leaflet map initialized with', locations.length, 'locations');
    }, [locations]);

    return (
        <div className="w-full h-full">
            <MapContainer
                center={[28.3949, 84.1240]}
                zoom={7}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ background: '#f0f0f0' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((location) => {
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
                                    {location.elevation && (
                                        <p className="text-xs text-gray-600">{location.elevation.toLocaleString()}m</p>
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
