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
                    className={`absolute z-[1000] bg-black/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-80 border border-white/20 ${className}`}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-display font-bold text-white text-xl tracking-tight">Filter Locations</h3>
                        <button onClick={onReset} className="text-xs font-medium text-white/50 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    {/* Elevation Slider */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                                <Ruler className="w-4 h-4 text-white/40" /> Min Elevation
                            </label>
                            <span className="text-amber-400 font-mono text-sm">{minElevation.toLocaleString()}m</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={maxElevation}
                            step="500"
                            value={minElevation}
                            onChange={(e) => setMinElevation(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-xs text-white/30 mt-2 font-mono">
                            <span>0m</span>
                            <span>{maxElevation.toLocaleString()}m</span>
                        </div>
                    </div>

                    {/* Regions */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                            <MapIcon className="w-4 h-4 text-white/40" /> Regions
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {regions.map(region => (
                                <button
                                    key={region}
                                    onClick={() => toggleRegion(region)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
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
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                            <Mountain className="w-4 h-4 text-white/40" /> Terrain Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
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

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                    >
                        <Check className="w-4 h-4" /> Apply Filters
                    </button>

                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors group">
                        <X className="w-5 h-5 text-white/40 group-hover:text-white" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
