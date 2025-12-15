import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Mountain, Ruler, Map as MapIcon, RotateCcw } from 'lucide-react';
import type { LocationType, Region } from '../../types';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTypes: LocationType[];
    toggleType: (type: LocationType) => void;
    selectedRegions: Region[];
    toggleRegion: (region: Region) => void;
    minElevation: number;
    setMinElevation: (elevation: number) => void;
    onReset: () => void;
    className?: string; // Allow custom positioning
}

export const FilterPanel = ({
    isOpen,
    onClose,
    selectedTypes,
    toggleType,
    selectedRegions,
    toggleRegion,
    minElevation,
    setMinElevation,
    onReset,
    className = "top-24 left-6" // Default position
}: FilterPanelProps) => {

    const regions: Region[] = ['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Kanchenjunga', 'Makalu', 'Dolpo', 'Mustang'];
    const types: LocationType[] = ['Peak', 'Valley', 'Lake', 'Monastery', 'Village', 'Route/Trek', 'Glacier', 'Basecamp'];
    const maxElevation = 8849; // Everest height

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className={`absolute z-[1000] bg-black/80 backdrop-blur-xl p-5 rounded-2xl shadow-2xl w-72 border border-white/20 ${className}`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display font-bold text-white text-base tracking-tight">Filter Locations</h3>
                    </div>

                    {/* Elevation Slider */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                                <Ruler className="w-3.5 h-3.5 text-white/40" /> Min Elevation
                            </label>
                            <span className="text-amber-400 font-mono text-xs">{minElevation.toLocaleString()}m</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={maxElevation}
                            step="500"
                            value={minElevation}
                            onChange={(e) => setMinElevation(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    {/* Regions */}
                    <div className="mb-4">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-white/80 mb-2">
                            <MapIcon className="w-3.5 h-3.5 text-white/40" /> Regions
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {regions.map(region => (
                                <button
                                    key={region}
                                    onClick={() => toggleRegion(region)}
                                    className={`
                                        px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border
                                        ${selectedRegions.includes(region)
                                            ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                    `}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Types */}
                    <div className="mb-5">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-white/80 mb-2">
                            <Mountain className="w-3.5 h-3.5 text-white/40" /> Terrain Type
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`
                                        px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border
                                        ${selectedTypes.includes(type)
                                            ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onReset}
                            className="px-3 py-2.5 bg-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/20 transition-colors flex items-center justify-center"
                            title="Reset Filters"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-white text-black rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                        >
                            <Check className="w-3.5 h-3.5" /> Apply Filters
                        </button>
                    </div>

                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors group">
                        <X className="w-4 h-4 text-white/40 group-hover:text-white" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
