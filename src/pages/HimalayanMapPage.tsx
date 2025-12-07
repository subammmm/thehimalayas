import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mockLocations } from '../data/mockData';
import { MapboxCanvas } from '../components/map/MapboxCanvas';
import { TopSearchBar } from '../components/map/TopSearchBar';
import { FilterButton } from '../components/map/FilterButton';
import { FilterPanel } from '../components/map/FilterPanel';
import { LocationPopover } from '../components/location/LocationPopover';
import { MobileBottomSheet } from '../components/location/MobileBottomSheet';
import type { LocationType, Region, Location } from '../types';

const HimalayanMapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get search query from navigation state (from home page)
    const initialSearch = location.state?.searchQuery || '';
    const selectedFromSearch = location.state?.selectedLocation || null;

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // Auto-select location if navigated from search
    useEffect(() => {
        if (selectedFromSearch) {
            setSelectedLocation(selectedFromSearch);
        }
    }, [selectedFromSearch]);

    const filteredLocations = useMemo(() => {
        return mockLocations.filter(loc => {
            const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.region.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(loc.type);
            const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(loc.region);

            return matchesSearch && matchesType && matchesRegion;
        });
    }, [searchQuery, selectedTypes, selectedRegions]);

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

    const activeFilterCount = selectedTypes.length + selectedRegions.length;

    return (
        <div className="relative w-full h-screen overflow-hidden bg-white">
            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-[1000] p-3 glass-overlay rounded-full shadow-lg hover:scale-105 transition-transform pointer-events-auto"
                aria-label="Back to home"
            >
                <ArrowLeft className="w-5 h-5 text-gray-800" />
            </button>

            <TopSearchBar value={searchQuery} onChange={setSearchQuery} />

            <FilterButton onClick={() => setIsFilterOpen(!isFilterOpen)} activeCount={activeFilterCount} />

            <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                selectedTypes={selectedTypes}
                toggleType={toggleType}
                selectedRegions={selectedRegions}
                toggleRegion={toggleRegion}
            />

            <AnimatePresence>
                {selectedLocation && (
                    <>
                        <LocationPopover
                            location={selectedLocation}
                            onClose={() => setSelectedLocation(null)}
                        />
                        <MobileBottomSheet
                            location={selectedLocation}
                            onClose={() => setSelectedLocation(null)}
                        />
                    </>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 z-0">
                <MapboxCanvas
                    locations={filteredLocations}
                    onLocationSelect={setSelectedLocation}
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
