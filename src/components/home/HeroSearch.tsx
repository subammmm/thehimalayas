import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Location } from '../../types';

interface HeroSearchProps {
    locations: Location[];
}

export const HeroSearch = ({ locations = [] }: HeroSearchProps) => {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const searchResults = query.length > 0
        ? locations.filter(loc =>
            loc.name?.toLowerCase().includes(query.toLowerCase()) ||
            loc.region?.toLowerCase().includes(query.toLowerCase()) ||
            loc.type?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8) // Increased to show more results
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
        navigate('/map', {
            state: {
                selectedLocation: location,
                searchQuery: location.name
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            handleSelect(searchResults[0]);
        } else if (query) {
            navigate('/map', {
                state: { searchQuery: query }
            });
        }
    };

    return (
        <div ref={containerRef} className="w-full max-w-3xl mx-auto relative">
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                onSubmit={handleSubmit}
                className={`
                    relative flex items-center gap-4 px-8 py-5
                    glass-overlay-dark
                    rounded-full
                    shadow-2xl shadow-black/50
                    transition-all duration-300
                    ${isFocused ? 'ring-2 ring-white/40' : ''}
                `}
            >
                <Search className="w-6 h-6 text-white/70 flex-shrink-0" />

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowResults(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search peaks, valleys, routes, monasteries..."
                    className="
                        flex-1 bg-transparent text-white text-lg
                        placeholder:text-white/40
                        focus:outline-none
                        text-base md:text-lg
                    "
                />

                <button
                    type="submit"
                    className="
                        flex items-center gap-2 px-6 py-3
                        bg-white hover:bg-white/95
                        text-black text-base font-semibold
                        rounded-full
                        transition-all duration-200
                        group
                        shadow-lg
                    "
                >
                    <span>Explore</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
            </motion.form>

            {/* Search Results Dropdown - Now Scrollable */}
            <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="
                            absolute top-full left-0 right-0 mt-3
                            glass-overlay
                            rounded-2xl overflow-hidden
                            shadow-2xl
                            max-h-96 overflow-y-auto
                            custom-scrollbar
                            z-50
                        "
                    >
                        {searchResults.map((location, index) => (
                            <motion.button
                                key={location.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleSelect(location)}
                                className="
                                    w-full flex items-center gap-4 px-6 py-4
                                    hover:bg-black/5 transition-colors
                                    border-b border-black/5 last:border-0
                                    text-left
                                "
                            >
                                <MapPin className="w-4 h-4 text-black/40 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-black truncate">
                                        {location.name}
                                    </p>
                                    <p className="text-xs text-black/50">
                                        {location.region} • {location.type}
                                    </p>
                                </div>
                                {location.elevation && (
                                    <span className="text-xs text-black/40 flex-shrink-0">
                                        {location.elevation.toLocaleString()}m
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
