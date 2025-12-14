import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import type { Location, LocationType } from '../../types';

// Use Cesium Ion's default public access token (works for everyone)
// For production, get your own free token at: https://ion.cesium.com/
const CESIUM_TOKEN = import.meta.env.VITE_CESIUM_TOKEN;

if (CESIUM_TOKEN) {
    Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;
    console.log('✅ Using custom Cesium token from env');
} else {
    // Use Cesium's example token (public, works for testing)
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg1YWUzMjYiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE';
    console.log('⚠️ Using Cesium public demo token');
}

interface CesiumCanvasProps {
    locations: Location[];
    onLocationSelect: (location: Location) => void;
    focusedLocation: Location | null;
}

const getColorByType = (type: LocationType): Cesium.Color => {
    switch (type) {
        case 'Peak': return Cesium.Color.ORANGE;
        case 'Valley': return Cesium.Color.GREEN;
        case 'Lake': return Cesium.Color.DEEPSKYBLUE;
        case 'Monastery': return Cesium.Color.PURPLE;
        case 'Village': return Cesium.Color.YELLOW;
        case 'Route/Trek': return Cesium.Color.BLUE;
        case 'Glacier': return Cesium.Color.CYAN;
        case 'Basecamp': return Cesium.Color.RED;
        default: return Cesium.Color.GRAY;
    }
};

export const CesiumCanvas = ({ locations, onLocationSelect, focusedLocation }: CesiumCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState('');

    // Initialize Cesium Viewer
    useEffect(() => {
        if (!containerRef.current || viewerRef.current) return;

        console.log('🌍 Initializing Cesium 3D Globe...');

        try {
            // Revert to strict Cesium Ion usage
            if (!Cesium.Ion.defaultAccessToken && !import.meta.env.VITE_CESIUM_TOKEN) {
                console.warn('⚠️ No Cesium Token found. Map may not load correctly.');
            }

            const viewer = new Cesium.Viewer(containerRef.current, {
                terrain: Cesium.Terrain.fromWorldTerrain({
                    requestWaterMask: true,
                    requestVertexNormals: true
                }),
                baseLayerPicker: false,
                geocoder: false,
                homeButton: false,
                sceneModePicker: false,
                timeline: false,
                navigationHelpButton: false,
                animation: false,
                fullscreenButton: false,
                vrButton: false,
                infoBox: true,
                selectionIndicator: true,
                shadows: true
            });

            viewerRef.current = viewer;

            // Enable lighting
            viewer.scene.globe.enableLighting = true;
            viewer.scene.globe.depthTestAgainstTerrain = true;

            // Position camera CLOSE to Himalayas
            viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(84.1240, 28.3949, 10000), // 10km altitude
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-20),
                    roll: 0.0
                }
            });

            console.log('✓ Cesium positioned at 10km altitude over Himalayas');
            setIsLoaded(true);

        } catch (err) {
            console.error('❌ Cesium error:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize Cesium');
        }

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, []);

    // Handle external focus (Search/Selection)
    useEffect(() => {
        if (!viewerRef.current || !isLoaded || !focusedLocation) return;

        console.log('🌍 3D FlyTo:', focusedLocation.name);

        viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                focusedLocation.coordinates.lng,
                focusedLocation.coordinates.lat,
                15000 // 15km altitude for view
            ),
            orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0.0
            },
            duration: 3
        });

    }, [focusedLocation, isLoaded]);

    // Add location markers
    useEffect(() => {
        if (!viewerRef.current || !isLoaded || locations.length === 0) return;

        console.log(`📍 Adding ${locations.length} markers...`);

        const entities: Cesium.Entity[] = [];

        locations.forEach(location => {
            if (!viewerRef.current) return;

            const entity = viewerRef.current.entities.add({
                position: Cesium.Cartesian3.fromDegrees(
                    location.coordinates.lng,
                    location.coordinates.lat,
                    location.elevation || 0
                ),
                point: {
                    pixelSize: 12,
                    color: getColorByType(location.type),
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                },
                label: {
                    text: location.name,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -15),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    showBackground: false
                },
                description: `
                    <div style="padding:10px;">
                        <h3>${location.name}</h3>
                        <p><strong>Type:</strong> ${location.type}</p>
                        <p><strong>Region:</strong> ${location.region}</p>
                        <p><strong>Elevation:</strong> ${location.elevation?.toLocaleString()}m</p>
                    </div>
                `
            } as any);

            entities.push(entity);
        });

        // Handle selection
        const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
        handler.setInputAction((click: any) => {
            const pickedObject = viewerRef.current?.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                const clickedEntity = pickedObject.id;
                const location = locations.find(loc =>
                    clickedEntity.position &&
                    loc.name === clickedEntity.label?.text?.getValue()
                );

                if (location && viewerRef.current) {
                    onLocationSelect(location);

                    // Fly to location
                    viewerRef.current.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(
                            location.coordinates.lng,
                            location.coordinates.lat,
                            50000
                        ),
                        orientation: {
                            heading: Cesium.Math.toRadians(0),
                            pitch: Cesium.Math.toRadians(-60),
                            roll: 0.0
                        },
                        duration: 2
                    });
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        return () => {
            handler.destroy();
            entities.forEach(e => viewerRef.current?.entities.remove(e));
        };
    }, [locations, isLoaded, onLocationSelect]);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="absolute inset-0" />

            {!isLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white font-medium text-lg">Loading 3D Globe...</p>
                        <p className="text-gray-400 text-sm mt-2">Initializing Cesium Terrain</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
                    <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
                        <p className="text-red-600 font-bold mb-2 text-lg">⚠️ Map Error</p>
                        <p className="text-gray-700 text-sm mb-4 font-mono bg-gray-100 p-3 rounded">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
