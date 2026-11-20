import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, List, X } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { MapboxCanvas } from '../components/map/MapboxCanvas';
import { TopSearchBar } from '../components/map/TopSearchBar';
import { FilterButton } from '../components/map/FilterButton';
import { FilterPanel } from '../components/map/FilterPanel';
import { LocationPopover } from '../components/location/LocationPopover';
import { MobileBottomSheet } from '../components/location/MobileBottomSheet';
import { mapUrl, matchesFilters, parseMapParams } from '../lib/sites';
import { usePageTitle } from '../hooks/usePageTitle';
import { useEscapeKey } from '../hooks/useEscapeKey';
import type { Location } from '../types';

// Cesium is only needed for the 3D view, so fetch it on first use.
// In production builds vite-plugin-cesium expects the prebuilt script as window.Cesium.
const CesiumCanvas = lazy(async () => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/cesium/Widgets/widgets.css';
    document.head.append(css);
    if (import.meta.env.PROD) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/cesium/Cesium.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.append(script);
        });
    }
    const module = await import('../components/map/CesiumCanvas');
    return { default: module.CesiumCanvas };
});

const HimalayanMapPage = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const { locations } = useLocations();
    usePageTitle('Map');

    // The view is shareable: ?q=<search>&type=<category>&district=<district>&site=<id>
    // (type and district may repeat). Read once on load, then kept in sync below.
    const [initial] = useState(() => parseMapParams(search));
    const [searchQuery, setSearchQuery] = useState(initial.query);
    const [selectedTypes, setSelectedTypes] = useState(initial.types);
    const [selectedRegions, setSelectedRegions] = useState(initial.districts);
    const [selectedId, setSelectedId] = useState(initial.site ?? null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Without a base map the list is the way in, so start with it open.
    const [isListOpen, setIsListOpen] = useState(!import.meta.env.VITE_MAPBOX_TOKEN && !initial.site);
    const [is3DMode, setIs3DMode] = useState(false);

    useEffect(() => {
        const next = mapUrl({ query: searchQuery, types: selectedTypes, districts: selectedRegions, site: selectedId ?? undefined });
        const nextSearch = next.slice('/map'.length);
        if (nextSearch !== window.location.search) navigate(next, { replace: true });
    }, [searchQuery, selectedTypes, selectedRegions, selectedId, navigate]);

    const selectedLocation = useMemo(
        () => locations.find(loc => loc.id === selectedId) ?? null,
        [locations, selectedId]
    );
    const selectLocation = useCallback((loc: Location) => setSelectedId(loc.id), []);

    const filteredLocations = useMemo(
        () => locations.filter(loc => matchesFilters(loc, { query: searchQuery, types: selectedTypes, districts: selectedRegions })),
        [searchQuery, selectedTypes, selectedRegions, locations]
    );
    const mappedCount = filteredLocations.filter(loc => loc.coordinates).length;

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
    };

    // Escape closes the topmost thing; the filter panel handles its own.
    useEscapeKey(() => {
        if (isListOpen) setIsListOpen(false);
        else if (is3DMode) setIs3DMode(false);
        else setSelectedId(null);
    }, !isFilterOpen && (isListOpen || is3DMode || selectedId !== null));

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-white">
            <h1 className="sr-only">Map of Khasa Malla historical sites</h1>

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
                onLocationSelect={selectLocation}
            />

            <FilterButton
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                activeCount={activeFilterCount}
                className="top-20 right-6 z-[1200]"
            />

            <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                locations={locations}
                selectedTypes={selectedTypes}
                toggleType={toggleType}
                selectedRegions={selectedRegions}
                toggleRegion={toggleRegion}
                onReset={resetFilters}
                className="top-36 right-6 z-[1200]"
            />

            <AnimatePresence>
                {selectedLocation && (
                    <LocationPopover
                        key="popover"
                        location={selectedLocation}
                        onClose={() => setSelectedId(null)}
                        on3DView={() => setIs3DMode(true)}
                    />
                )}
                {/* The sheet is 85% of the screen, so it steps aside while the 3D view is open. */}
                {selectedLocation && !is3DMode && (
                    <MobileBottomSheet
                        key="sheet"
                        location={selectedLocation}
                        onClose={() => setSelectedId(null)}
                        on3DView={() => setIs3DMode(true)}
                    />
                )}
            </AnimatePresence>

            {/* 3D Mode Overlay */}
            {is3DMode && (
                <div className="absolute inset-0 z-[1100]">
                    <Suspense fallback={<div className="absolute inset-0 bg-gray-900" />}>
                        <CesiumCanvas
                            locations={locations}
                            onLocationSelect={selectLocation}
                            focusedLocation={selectedLocation}
                        />
                    </Suspense>
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
                    onLocationSelect={selectLocation}
                    focusedLocation={selectedLocation}
                />
            </div>

            {/* Site list: every filtered site, including the ones without coordinates */}
            {isListOpen && (
                <section
                    aria-label="Site list"
                    className="absolute bottom-24 left-4 right-4 md:left-8 md:right-auto md:w-80 z-[1200] glass-overlay rounded-xl shadow-lg max-h-[50dvh] flex flex-col pointer-events-auto"
                >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-black/10">
                        <h2 className="font-semibold text-sm text-gray-800">
                            {filteredLocations.length} {filteredLocations.length === 1 ? 'site' : 'sites'}
                        </h2>
                        <button onClick={() => setIsListOpen(false)} aria-label="Close site list" className="p-1 rounded-full hover:bg-black/10">
                            <X className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>
                    {filteredLocations.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-600">No sites match the search and filters.</p>
                    ) : (
                        <ul className="overflow-y-auto py-1">
                            {filteredLocations.map(loc => (
                                <li key={loc.id}>
                                    <button
                                        onClick={() => {
                                            // the site panel opens where the list is
                                            setSelectedId(loc.id);
                                            setIsListOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-black/5"
                                    >
                                        <span className="block text-sm font-medium text-gray-900 truncate">{loc.name}</span>
                                        <span className="block text-xs text-gray-600 truncate">
                                            {loc.entry_no} · {loc.region} · {loc.type}{loc.coordinates ? '' : ' · not on map'}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            {/* Site counter, opens the list */}
            <button
                onClick={() => setIsListOpen(!isListOpen)}
                aria-expanded={isListOpen}
                className="absolute bottom-8 left-4 md:left-8 z-[1200] glass-overlay px-4 py-2 rounded-lg shadow-lg pointer-events-auto flex items-center gap-2 font-medium text-gray-800 hover:bg-white"
            >
                <List className="w-4 h-4" />
                {filteredLocations.length} {filteredLocations.length === 1 ? 'site' : 'sites'} · {mappedCount} on map
            </button>

            {/* Legend - Historical Site Types */}
            <div className={`absolute bottom-24 md:bottom-8 right-8 z-[1200] glass-overlay p-4 rounded-xl shadow-lg max-w-xs pointer-events-auto ${isListOpen ? 'hidden md:block' : ''}`}>
                <h2 className="font-semibold text-sm mb-2 text-gray-800">Legend</h2>
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
