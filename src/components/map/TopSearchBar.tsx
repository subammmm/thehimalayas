import { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '../../types';

interface TopSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    locations: Location[];
    onLocationSelect: (location: Location) => void;
}

export const TopSearchBar = ({ value, onChange, locations, onLocationSelect }: TopSearchBarProps) => {
    const [showResults, setShowResults] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const searchResults = value.length > 0
        ? locations.filter(loc =>
            loc.name?.toLowerCase().includes(value.toLowerCase()) ||
            loc.region?.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5)
        : [];

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSelect = (location: Location) => {
        onChange(location.name);
        onLocationSelect(location);
        setShowResults(false);
    };

    return (
        <div ref={containerRef} className="absolute top-6 left-0 right-0 z-[1000] flex justify-center pointer-events-none px-4">
            <div className={`
                pointer-events-auto w-full max-w-md 
                bg-white/80 backdrop-blur-md 
                rounded-[2rem] 
                shadow-lg transition-all duration-300
                ${showResults && searchResults.length > 0 ? 'rounded-b-[1.5rem] rounded-t-[1.5rem]' : ''}
            `}>
                <div className="flex items-center p-3 pl-5">
                    <Search className="w-5 h-5 text-gray-500 mr-3" />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => {
                            setShowResults(true);
                        }}
                        placeholder="Search locations..."
                        className="bg-transparent border-none outline-none flex-grow text-gray-800 placeholder-gray-500 font-medium text-base min-w-0"
                    />
                </div>

                <AnimatePresence>
                    {showResults && searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-gray-100"
                        >
                            <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
                                {searchResults.map((location) => (
                                    <button
                                        key={location.id}
                                        onClick={() => handleSelect(location)}
                                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-black/5 text-left transition-colors"
                                    >
                                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">{location.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{location.region} • {location.type}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
