import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { LocationType, Region } from '../../types';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTypes: LocationType[];
    toggleType: (type: LocationType) => void;
    selectedRegions: Region[];
    toggleRegion: (region: Region) => void;
    className?: string;
}

const TYPES: { type: LocationType; color: string }[] = [
    { type: 'Peak', color: 'bg-orange-500' },
    { type: 'Valley', color: 'bg-green-500' },
    { type: 'Lake', color: 'bg-sky-500' },
    { type: 'Monastery', color: 'bg-purple-500' },
    { type: 'Village', color: 'bg-yellow-500' },
    { type: 'Route/Trek', color: 'bg-blue-500' },
    { type: 'Glacier', color: 'bg-cyan-500' },
    { type: 'Basecamp', color: 'bg-red-500' },
];

const REGIONS: Region[] = [
    'Everest', 'Annapurna', 'Langtang', 'Manaslu',
    'Kanchenjunga', 'Makalu', 'Dolpo', 'Mustang'
];

export const FilterPanel = ({
    isOpen,
    onClose,
    selectedTypes,
    toggleType,
    selectedRegions,
    toggleRegion
}: FilterPanelProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute top-20 right-6 z-[1000] w-80 max-w-[calc(100vw-3rem)] glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-140px)]"
                >
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white/50">
                        <h3 className="font-semibold text-gray-800">Filters</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-4 space-y-6">
                        {/* Type Filter */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location Type</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {TYPES.map(({ type, color }) => (
                                    <button
                                        key={type}
                                        onClick={() => toggleType(type)}
                                        className={`flex items-center p-2 rounded-lg text-sm transition-all ${selectedTypes.includes(type)
                                            ? 'bg-gray-800 text-white shadow-md'
                                            : 'bg-white/50 text-gray-600 hover:bg-white'
                                            }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full mr-2 ${color}`} />
                                        {type}
                                        {selectedTypes.includes(type) && <Check className="w-3 h-3 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Region Filter */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Region</h4>
                            <div className="flex flex-wrap gap-2">
                                {REGIONS.map((region) => (
                                    <button
                                        key={region}
                                        onClick={() => toggleRegion(region)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedRegions.includes(region)
                                            ? 'bg-gray-800 text-white shadow-md'
                                            : 'bg-white/50 text-gray-600 hover:bg-white border border-transparent'
                                            }`}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white/50 border-t border-gray-200">
                        <button
                            onClick={() => {
                                // Logic to clear filters could be passed here, or just let user toggle manually
                                // For now just close or apply
                                onClose();
                            }}
                            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            View Results
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
