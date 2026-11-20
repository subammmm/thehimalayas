import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Building, Map as MapIcon, RotateCcw } from 'lucide-react';
import type { Location } from '../../types';
import { countBy } from '../../lib/sites';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    locations: Location[]; // the options and their counts come from the data
    selectedTypes: string[];
    toggleType: (type: string) => void;
    selectedRegions: string[];
    toggleRegion: (region: string) => void;
    onReset: () => void;
    className?: string;
}

export const FilterPanel = ({
    isOpen,
    onClose,
    locations,
    selectedTypes,
    toggleType,
    selectedRegions,
    toggleRegion,
    onReset,
    className = "top-24 left-6"
}: FilterPanelProps) => {
    useEscapeKey(onClose, isOpen);

    const regions = countBy(locations, site => [site.region]);
    const types = countBy(locations, site => site.categories);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    role="dialog"
                    aria-label="Filter sites"
                    className={`absolute z-[1000] bg-black/80 backdrop-blur-xl p-5 rounded-2xl shadow-2xl w-72 max-w-[calc(100vw-2rem)] max-h-[70dvh] overflow-y-auto border border-white/20 ${className}`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display font-bold text-white text-base tracking-tight">Filter Sites</h3>
                    </div>

                    {/* Districts */}
                    <div className="mb-4">
                        <h4 className="flex items-center gap-1.5 text-xs font-medium text-white/80 mb-2">
                            <MapIcon className="w-3.5 h-3.5 text-white/40" /> Districts
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {regions.map(([region, count]) => (
                                <button
                                    key={region}
                                    onClick={() => toggleRegion(region)}
                                    aria-pressed={selectedRegions.includes(region)}
                                    className={`
                                        px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border
                                        ${selectedRegions.includes(region)
                                            ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                    `}
                                >
                                    {region} <span className="opacity-60">{count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Site Types */}
                    <div className="mb-5">
                        <h4 className="flex items-center gap-1.5 text-xs font-medium text-white/80 mb-2">
                            <Building className="w-3.5 h-3.5 text-white/40" /> Site Type
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {types.map(([type, count]) => (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    aria-pressed={selectedTypes.includes(type)}
                                    className={`
                                        px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border
                                        ${selectedTypes.includes(type)
                                            ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                    `}
                                >
                                    {type} <span className="opacity-60">{count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onReset}
                            className="px-3 py-2.5 bg-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/20 transition-colors flex items-center justify-center"
                            title="Reset filters"
                            aria-label="Reset filters"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-white text-black rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                        >
                            <Check className="w-3.5 h-3.5" /> Done
                        </button>
                    </div>

                    <button onClick={onClose} aria-label="Close filters" className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors group">
                        <X className="w-4 h-4 text-white/40 group-hover:text-white" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
