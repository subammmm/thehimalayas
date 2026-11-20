import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { HistoricalSite } from '../../types';
import { markerPositions, typeColor } from '../../lib/sites';

// Type alias for backward compatibility
type Location = HistoricalSite;

// Get token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapboxCanvasProps {
    locations: Location[];
    onLocationSelect: (location: Location) => void;
    focusedLocation: Location | null;
    // Shown under the notice when the base map cannot load: what still works on this page
    fallbackHint?: string;
}

export const MapboxCanvas = ({ locations, onLocationSelect, focusedLocation, fallbackHint = 'Search, filters and the site list still work.' }: MapboxCanvasProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<mapboxgl.Marker[]>([]);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [notice, setNotice] = useState(MAPBOX_TOKEN ? '' : 'No Mapbox access token is configured (VITE_MAPBOX_TOKEN).');

    // Initialize map
    useEffect(() => {

        if (!mapContainer.current) {
            console.error('❌ No map container!');
            console.error('Map container missing');
            return;
        }

        if (map.current) {
            return;
        }

        if (!MAPBOX_TOKEN) return; // the notice below explains



        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                // Extent of the mapped sites (Dailekh to Mugu). The old fixed view was centred on
                // central Nepal, which left every marker off-screen on a phone.
                bounds: [[81.55, 28.78], [82.40, 29.60]],
                fitBoundsOptions: { padding: 60 },
                pitch: 45, // Less aggressive pitch for initial load
                antialias: true
            });

            // Add navigation
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // Wait for map load
            let hasLoaded = false;
            map.current.on('load', () => {
                hasLoaded = true;

                try {
                    if (!map.current) return;

                    // Add 3D terrain
                    map.current.addSource('mapbox-dem', {
                        type: 'raster-dem',
                        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                        tileSize: 512,
                        maxzoom: 14
                    });

                    map.current.setTerrain({
                        source: 'mapbox-dem',
                        exaggeration: 1.5
                    });

                    // Add sky
                    map.current.addLayer({
                        id: 'sky',
                        type: 'sky',
                        paint: {
                            'sky-type': 'atmosphere',
                            'sky-atmosphere-sun': [0.0, 0.0],
                            'sky-atmosphere-sun-intensity': 15
                        }
                    });

                    setIsMapLoaded(true);
                } catch (err) {
                    console.error('❌ Error adding terrain:', err);
                    console.error('Failed to add 3D terrain: ' + (err instanceof Error ? err.message : String(err)));
                }
            });

            // Handle errors
            map.current.on('error', (e) => {
                console.error('❌ Mapbox error event:', e);
                // Before the first load, 401 or 403 means the token was refused
                // (malformed, revoked or restricted to another URL)
                if (!hasLoaded && [401, 403].includes((e.error as { status?: number } | undefined)?.status ?? 0)) {
                    setNotice('The Mapbox access token was rejected (VITE_MAPBOX_TOKEN).');
                }
            });

        } catch (err) {
            console.error('❌ Failed to create map:', err);
            console.error('Failed to create map: ' + (err instanceof Error ? err.message : String(err)));
        }

        return () => {
            markers.current.forEach(m => m.remove());
            markers.current = [];
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Handle external focus changes (SEARCH or CLICK)
    useEffect(() => {
        if (!map.current || !isMapLoaded || !focusedLocation || !focusedLocation.coordinates) return;

        map.current.flyTo({
            center: [focusedLocation.coordinates.lng, focusedLocation.coordinates.lat],
            zoom: 14,
            pitch: 60,
            bearing: 0,
            duration: 3000,
            essential: true
        });

        // Add a pulsing marker effect or popup?
        // For now just moving the camera is sufficient.

    }, [focusedLocation, isMapLoaded]);

    // Update markers when locations change
    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        // Remove existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add new markers (only for locations with valid coordinates)
        const positions = markerPositions(locations);
        locations
            .forEach(location => {
                const coords = positions.get(location.id);
                if (!coords) return; // no coordinates recorded

                const color = typeColor(location.type);

                // Create marker container (Mapbox positions this)
                // A real button, so markers can be reached and activated from the keyboard
                const container = document.createElement('button');
                container.type = 'button';
                container.className = 'marker-container';
                container.setAttribute('aria-label', `${location.name}, ${location.type}, ${location.entry_no}`);
                container.style.cssText = `
                    width: 20px;
                    height: 20px;
                    padding: 0;
                    border: 0;
                    border-radius: 50%;
                    background: none;
                    cursor: pointer;
                `;

                // Create visible inner dot (we animate this)
                const inner = document.createElement('div');
                inner.className = 'custom-mapbox-marker';
                inner.style.cssText = `
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: ${color};
                    border: 3px solid white;
                    box-shadow: 0 0 0 2px ${color}40, 0 4px 12px rgba(0,0,0,0.3);
                    transition: transform 0.2s ease;
                    transform-origin: center center;
                    will-change: transform;
                `;
                container.appendChild(inner);

                // Hover effects on the inner element
                container.addEventListener('mouseenter', () => {
                    inner.style.transform = 'scale(1.3)';
                    container.style.zIndex = '1000';
                });

                container.addEventListener('mouseleave', () => {
                    inner.style.transform = 'scale(1)';
                    container.style.zIndex = 'auto';
                });

                const marker = new mapboxgl.Marker({
                    element: container,
                    anchor: 'center'
                })
                    .setLngLat([coords.lng, coords.lat])
                    .addTo(map.current!);

                // Add click handler
                container.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onLocationSelect(location);

                    // Fly to location with smooth animation
                    if (location.coordinates) {
                        map.current?.flyTo({
                            center: [location.coordinates.lng, location.coordinates.lat],
                            zoom: 13,
                            pitch: 70,
                            bearing: 30,
                            duration: 2000,
                            essential: true
                        });
                    }
                });

                markers.current.push(marker);
            });
    }, [locations, isMapLoaded, onLocationSelect]);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapContainer}
                className="absolute inset-0 w-full h-full"
                style={{ minHeight: '100dvh' }}
            />
            {notice && (
                <div role="alert" className="absolute inset-0 flex items-start justify-center bg-gray-100 px-6 pt-36">
                    <div className="max-w-sm text-center">
                        <p className="font-semibold text-gray-900 mb-2">The base map could not be loaded</p>
                        <p className="text-sm text-gray-600">{notice} {fallbackHint}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
