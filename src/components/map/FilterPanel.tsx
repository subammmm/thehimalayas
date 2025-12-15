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
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    className={`absolute z-[1000] bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-80 border border-white/20 ${className}`}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 text-lg">Filter Locations</h3>
                        <button onClick={onReset} className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    {/* Elevation Slider */}
                    {/* ... (rest of logic same as before but using safe types) */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Ruler className="w-4 h-4 text-gray-400" /> Min Elevation
                            </label>
                            <span className="text-amber-600 font-mono text-sm">{minElevation.toLocaleString()}m</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={maxElevation}
                            step="500"
                            value={minElevation}
                            onChange={(e) => setMinElevation(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>0m</span>
                            <span>{maxElevation.toLocaleString()}m</span>
                        </div>
                    </div>

                    {/* Regions */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <MapIcon className="w-4 h-4 text-gray-400" /> Regions
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {regions.map(region => (
                                <button
                                    key={region}
                                    onClick={() => toggleRegion(region)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border
                                        ${selectedRegions.includes(region)
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                                    `}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Types */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <Mountain className="w-4 h-4 text-gray-400" /> Terrain Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border
                                        ${selectedTypes.includes(type)
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Done
                    </button>

                    <button onClick={onClose} className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
