import { useState, useMemo } from 'react';
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
import type { Location } from '../types';

const HimalayanMapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { locations, loading, error } = useLocations();

    // Get search query from navigation state (from home page)
    const initialSearch = location.state?.searchQuery || '';
    const selectedFromSearch = location.state?.selectedLocation || null;

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [minElevation, setMinElevation] = useState(0);
    // Initialize with selectedFromSearch if available, avoiding setState in useEffect
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(selectedFromSearch);
    const [is3DMode, setIs3DMode] = useState(false);

    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.type.toLowerCase().includes(searchQuery.toLowerCase());

            // Check if any selected type matches (partial match for combined types like "Deval / Fountain")
            const matchesType = selectedTypes.length === 0 ||
                selectedTypes.some(selType => loc.type.toLowerCase().includes(selType.toLowerCase()));

            // Check if district matches
            const matchesRegion = selectedRegions.length === 0 ||
                selectedRegions.some(selRegion => loc.region.toLowerCase().includes(selRegion.toLowerCase()));

            return matchesSearch && matchesType && matchesRegion;
        });
    }, [searchQuery, selectedTypes, selectedRegions, locations]);

    // Determine if any filters are active (excluding search)
    const hasActiveFilters = useMemo(() => {
        return searchQuery.length > 0 ||
            selectedTypes.length > 0 ||
            selectedRegions.length > 0;
    }, [searchQuery, selectedTypes, selectedRegions]);

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleRegion = (region: string) => {
        setSelectedRegions(prev =>
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        );
    };

    const activeFilterCount = selectedTypes.length + selectedRegions.length;

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
                }}
            />

            <FilterButton
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                activeCount={activeFilterCount}
                className="top-20 right-6 z-[1200]"
            />

            {/* Status Indicators */}
            {(loading || error) && (
                <div className="absolute top-24 left-6 z-[900] pointer-events-none">
                    {loading && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-sm font-medium text-gray-700">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            Loading historical sites...
                        </div>
                    )}
                    {error && (
                        <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-50/90 backdrop-blur rounded-full shadow-lg text-sm font-medium text-red-700 border border-red-200">
                            Error loading data ({error})
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
                className="top-36 right-6 z-[1200]"
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
            <div className="absolute bottom-8 left-8 z-[1200] glass-overlay px-4 py-2 rounded-lg shadow-lg pointer-events-auto">
                <span className="font-medium text-gray-800">Showing {filteredLocations.length} sites</span>
            </div>

            {/* Legend - Historical Site Types */}
            <div className="absolute bottom-8 right-8 z-[1200] glass-overlay p-4 rounded-xl shadow-lg max-w-xs pointer-events-auto">
                <h4 className="font-semibold text-sm mb-2 text-gray-800">Legend</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-400 mr-2"></span>Stele</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>Pillar</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>Deval</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-lime-500 mr-2"></span>Stupa</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Temple</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></span>Fountain</div>
                </div>
            </div>
        </div>
    );
};

export default HimalayanMapPage;
