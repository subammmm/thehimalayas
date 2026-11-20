import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import type { HistoricalSite, SiteType } from '../../types';
import { markerPositions } from '../../lib/sites';

// Type alias for backward compatibility
type Location = HistoricalSite;
type LocationType = SiteType;

const CESIUM_TOKEN = import.meta.env.VITE_CESIUM_TOKEN;

if (CESIUM_TOKEN) Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

interface CesiumCanvasProps {
    locations: Location[];
    onLocationSelect: (location: Location) => void;
    focusedLocation: Location | null;
}

const getColorByType = (type: LocationType | string): Cesium.Color => {
    // Normalize type for matching (handle variations)
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('stele')) return Cesium.Color.GOLD;
    if (normalizedType.includes('pillar')) return Cesium.Color.ORANGE;
    if (normalizedType.includes('deval')) return Cesium.Color.PURPLE;
    if (normalizedType.includes('stupa')) return Cesium.Color.LIME;
    if (normalizedType.includes('temple')) return Cesium.Color.RED;
    if (normalizedType.includes('fountain')) return Cesium.Color.CYAN;
    if (normalizedType.includes('fort')) return Cesium.Color.BROWN;
    if (normalizedType.includes('palace')) return Cesium.Color.CRIMSON;
    if (normalizedType.includes('inscription')) return Cesium.Color.YELLOW;
    if (normalizedType.includes('monastery') || normalizedType.includes('vihara')) return Cesium.Color.MAGENTA;
    if (normalizedType.includes('remains')) return Cesium.Color.ROSYBROWN;
    if (normalizedType.includes('museum')) return Cesium.Color.DEEPSKYBLUE;
    if (normalizedType.includes('mounds')) return Cesium.Color.SANDYBROWN;
    if (normalizedType.includes('sculpture')) return Cesium.Color.CORAL;
    if (normalizedType.includes('pavilion')) return Cesium.Color.MEDIUMPURPLE;

    return Cesium.Color.GRAY;
};

export const CesiumCanvas = ({ locations, onLocationSelect, focusedLocation }: CesiumCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(CESIUM_TOKEN ? '' : 'No Cesium ion access token is configured (VITE_CESIUM_TOKEN), so terrain and imagery cannot be loaded.');

    // Initialize Cesium Viewer
    useEffect(() => {
        if (!CESIUM_TOKEN || !containerRef.current || viewerRef.current) return;

        const initCesium = async () => {
            try {
                const terrain = Cesium.Terrain.fromWorldTerrain({
                    requestWaterMask: true,
                    requestVertexNormals: true
                });
                // A rejected token otherwise leaves a black globe with no explanation (ion answers 401)
                terrain.errorEvent.addEventListener(() => {
                    setError('Cesium terrain could not be loaded. Check the access token (VITE_CESIUM_TOKEN) and the network connection.');
                });

                const viewer = new Cesium.Viewer(containerRef.current as HTMLElement, {
                    terrain,
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
                    shadows: true,
                    skyAtmosphere: new Cesium.SkyAtmosphere()
                });

                viewerRef.current = viewer;

                // Add base imagery layer asynchronously
                try {
                    const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(2); // Bing Maps Aerial
                    viewer.imageryLayers.addImageryProvider(imageryProvider);
                } catch (imgError) {
                    console.warn('⚠️ Failed to load Ion imagery, trying OpenStreetMap fallback:', imgError);
                    // Fallback to OSM if Ion fails
                    const osmProvider = new Cesium.OpenStreetMapImageryProvider({
                        url: 'https://a.tile.openstreetmap.org/'
                    });
                    viewer.imageryLayers.addImageryProvider(osmProvider);
                }

                // Enable lighting and HDR
                viewer.scene.globe.enableLighting = true;
                viewer.scene.highDynamicRange = true;
                viewer.scene.globe.depthTestAgainstTerrain = true;
                if (viewer.scene.sun) {
                    viewer.scene.sun.show = true;
                }

                // Set time to noon for best lighting
                viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date('2024-05-15T12:00:00Z'));

                // Position camera CLOSE to Himalayas
                viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(84.1240, 28.3949, 15000), // 15km altitude (slightly higher)
                    orientation: {
                        heading: Cesium.Math.toRadians(0),
                        pitch: Cesium.Math.toRadians(-20),
                        roll: 0.0
                    }
                });

                setIsLoaded(true);

            } catch (err) {
                console.error('❌ Cesium error:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize Cesium');
            }
        };

        initCesium();

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, []);

    // Handle external focus (Search/Selection)
    useEffect(() => {
        if (!viewerRef.current || !isLoaded || !focusedLocation || !focusedLocation.coordinates) return;

        const cameraLat = focusedLocation.coordinates.lat - 0.08; // Stand off South

        viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                focusedLocation.coordinates.lng,
                cameraLat,
                8000
            ),
            orientation: {
                heading: Cesium.Math.toRadians(0), // Look North
                pitch: Cesium.Math.toRadians(-20), // Slight look down
                roll: 0.0
            },
            duration: 3
        });

    }, [focusedLocation, isLoaded]);

    // Add location markers
    useEffect(() => {
        if (!viewerRef.current || !isLoaded || locations.length === 0) return;

        const entities: Cesium.Entity[] = [];
        // Names repeat ("Dullu" is eight different sites), so clicks are resolved by entity
        const locationByEntity = new Map<Cesium.Entity, Location>();
        const positions = markerPositions(locations);

        locations.forEach(location => {
            const coords = positions.get(location.id);
            if (!viewerRef.current || !coords) return;

            const entity = viewerRef.current.entities.add({
                position: Cesium.Cartesian3.fromDegrees(coords.lng, coords.lat, 0),
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
                        <p><strong>District:</strong> ${location.region}</p>
                        ${location.documentation ? `<p><strong>Notes:</strong> ${location.documentation.substring(0, 200)}...</p>` : ''}
                    </div>
                `
            });

            entities.push(entity);
            locationByEntity.set(entity, location);
        });

        // Handle selection
        const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
        handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const pickedObject = viewerRef.current?.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                const location = locationByEntity.get(pickedObject.id);

                if (location && location.coordinates && viewerRef.current) {
                    onLocationSelect(location);

                    const cameraLat = location.coordinates.lat - 0.08;

                    // Fly to location
                    viewerRef.current.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(
                            location.coordinates.lng,
                            cameraLat,
                            8000
                        ),
                        orientation: {
                            heading: Cesium.Math.toRadians(0),
                            pitch: Cesium.Math.toRadians(-20),
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
                <div role="alert" className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10 p-6">
                    <div className="max-w-sm text-center">
                        <p className="font-semibold text-white mb-2">The 3D view could not be loaded</p>
                        <p className="text-sm text-gray-300">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
