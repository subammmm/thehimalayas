import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { MapboxCanvas } from '../components/map/MapboxCanvas';
import { CesiumCanvas } from '../components/map/CesiumCanvas';
import { TopSearchBar } from '../components/map/TopSearchBar';
import { FilterButton } from '../components/map/FilterButton';
import { FilterPanel } from '../components/map/FilterPanel';
import { LocationPopover } from '../components/location/LocationPopover';
import { MobileBottomSheet } from '../components/location/MobileBottomSheet';
import type { LocationType, Region, Location } from '../types';

const HimalayanMapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { locations, loading, error } = useLocations();

    // Get search query from navigation state (from home page)
    const initialSearch = location.state?.searchQuery || '';
    const selectedFromSearch = location.state?.selectedLocation || null;

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
    const [minElevation, setMinElevation] = useState(0);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [is3DMode, setIs3DMode] = useState(false);

    // Auto-select location if navigated from search
    useEffect(() => {
        if (selectedFromSearch) {
            setSelectedLocation(selectedFromSearch);
        }
    }, [selectedFromSearch]);

    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.region.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(loc.type);
            const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(loc.region);
            const matchesElevation = (loc.elevation || 0) >= minElevation;

            return matchesSearch && matchesType && matchesRegion && matchesElevation;
        });
    }, [searchQuery, selectedTypes, selectedRegions, minElevation, locations]);

    // Determine if any filters are active (excluding search)
    const hasActiveFilters = useMemo(() => {
        return searchQuery.length > 0 ||
            selectedTypes.length > 0 ||
            selectedRegions.length > 0 ||
            minElevation > 0;
    }, [searchQuery, selectedTypes, selectedRegions, minElevation]);

    const toggleType = (type: LocationType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleRegion = (region: Region) => {
        setSelectedRegions(prev =>
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        );
    };

    const activeFilterCount = selectedTypes.length + selectedRegions.length + (minElevation > 0 ? 1 : 0);

    const resetFilters = () => {
        setSelectedTypes([]);
        setSelectedRegions([]);
        setMinElevation(0);
    };

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-white">
            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-[1000] p-3 glass-overlay rounded-full shadow-lg hover:scale-105 transition-transform pointer-events-auto"
                aria-label="Back to home"
            >
                <ArrowLeft className="w-5 h-5 text-gray-800" />
            </button>

            <TopSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                locations={locations}
                onLocationSelect={(loc) => {
                    setSelectedLocation(loc);
                    // Also fly to it immediately
                    // The useEffect logic for 'selectedLocation' changes might handle this, 
                    // but we ensure it's set as the focused/selected one.
                }}
            />

            <FilterButton
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                activeCount={activeFilterCount}
                className="top-20 right-6"
            />

            {/* Status Indicators */}
            {(loading || error) && (
                <div className="absolute top-24 left-6 z-[900] pointer-events-none">
                    {loading && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-sm font-medium text-gray-700">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            Loading locations...
                        </div>
                    )}
                    {error && (
                        <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-50/90 backdrop-blur rounded-full shadow-lg text-sm font-medium text-red-700 border border-red-200">
                            Using offline data ({error})
                        </div>
                    )}
                </div>
            )}

            <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                selectedTypes={selectedTypes}
                toggleType={toggleType}
                selectedRegions={selectedRegions}
                toggleRegion={toggleRegion}
                minElevation={minElevation}
                setMinElevation={setMinElevation}
                onReset={resetFilters}
                className="top-36 right-6"
            />

            <AnimatePresence>
                {selectedLocation && (
                    <>
                        <LocationPopover
                            location={selectedLocation}
                            onClose={() => setSelectedLocation(null)}
                            on3DView={() => setIs3DMode(true)}
                        />
                        <MobileBottomSheet
                            location={selectedLocation}
                            onClose={() => setSelectedLocation(null)}
                            on3DView={() => setIs3DMode(true)}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* 3D Mode Overlay */}
            {is3DMode && (
                <div className="absolute inset-0 z-[1100]">
                    <CesiumCanvas
                        locations={locations}
                        filteredLocations={filteredLocations}
                        onLocationSelect={setSelectedLocation}
                        focusedLocation={selectedLocation}
                        showConnections={hasActiveFilters}
                    />
                    <button
                        onClick={() => setIs3DMode(false)}
                        className="absolute top-6 left-20 z-[1200] px-6 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg font-medium text-black hover:bg-white transition-colors flex items-center gap-2 pointer-events-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Map
                    </button>
                </div>
            )}

            <div className="absolute inset-0 z-0">
                <MapboxCanvas
                    locations={filteredLocations}
                    onLocationSelect={setSelectedLocation}
                    focusedLocation={selectedLocation}
                    showConnections={hasActiveFilters}
                />
            </div>

            {/* Location Counter */}
            <div className="absolute bottom-8 left-8 z-[900] glass-overlay px-4 py-2 rounded-lg shadow-lg pointer-events-auto">
                <span className="font-medium text-gray-800">Showing {filteredLocations.length} locations</span>
            </div>

            {/* Legend - could be a component but fine here for now */}
            <div className="absolute bottom-8 right-8 z-[900] glass-overlay p-4 rounded-xl shadow-lg max-w-xs pointer-events-auto">
                <h4 className="font-semibold text-sm mb-2 text-gray-800">Legend</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>Peak</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Valley</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-sky-500 mr-2"></span>Lake</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>Monastery</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>Village</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Route</div>
                </div>
            </div>
        </div>
    );
};

export default HimalayanMapPage;
