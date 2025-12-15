import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain } from 'lucide-react';
import { Link } from 'react-router-dom'; // Keep Link if used, or remove both if unused
// Actually Link is used for Logo. useNavigate is used? No, HeroSearch handles navigation.
// Let's check line 4.

import { HeroSearch } from '../components/home/HeroSearch';
import { FilterButton } from '../components/map/FilterButton';
import { FilterPanel } from '../components/map/FilterPanel';
import { mockLocations } from '../data/mockData';
import type { LocationType, Region } from '../types';

const Home = () => {
    // Derived stats


    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
    const [minElevation, setMinElevation] = useState(0);

    const toggleType = (type: LocationType) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const toggleRegion = (region: Region) => {
        setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
    };

    const handleReset = () => {
        setSelectedTypes([]);
        setSelectedRegions([]);
        setMinElevation(0);
    };

    // Derived stats
    const totalLocations = "100+";
    const countries = 3;

    return (
        <div className="min-h-screen bg-black">
            {/* Full-Screen Hero Section */}
            <section className="relative h-[100dvh] w-full">
                {/* Background Image Wrapper */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Animated 4K Background Image with 3D panning effect */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            scale: [1, 1.1, 1],
                            x: [0, -20, 0],
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3840&auto=format&fit=crop"
                            alt="The Himalayas"
                            className="w-full h-full object-cover scale-110"
                            style={{ imageRendering: '-webkit-optimize-contrast' }}
                        />
                        {/* Subtle gradient for depth and readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
                    </motion.div>
                </div>

                {/* Logo - Top Left */}
                <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20">
                    <Link to="/" className="flex items-center gap-3 group">
                        <Mountain className="w-8 h-8 text-white" />
                        <span className="text-xl font-display font-semibold text-white tracking-tight">
                            The Himalayas
                        </span>
                    </Link>
                </div>

                {/* About Link - Top Right */}
                <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20 flex gap-6">
                    <Link to="/atlas" className="text-amber-400/90 hover:text-amber-300 transition-colors text-sm font-medium tracking-wide uppercase">
                        Atlas
                    </Link>
                    <Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm font-medium tracking-wide uppercase">
                        About
                    </Link>
                </div>

                {/* Hero Content - Centered */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-6">
                    {/* Title and Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center mb-16 md:scale-[0.85] origin-center"
                    >
                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-bold text-white mb-6 leading-none tracking-tight">
                            The Himalayas
                        </h1>
                        <p className="text-lg md:text-2xl text-white/80 font-light tracking-wide">
                            Explore the world's highest peaks and sacred valleys
                        </p>
                    </motion.div>

                    {/* Centered Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                        className="w-full max-w-2xl flex items-center gap-4 relative"
                    >
                        <div className="flex-1">
                            <HeroSearch
                                locations={mockLocations}
                                filters={{ selectedTypes, selectedRegions, minElevation }}
                            />
                        </div>

                        <div className="relative z-[1001]">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FilterButton
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    activeCount={selectedTypes.length + selectedRegions.length + (minElevation > 0 ? 1 : 0)}
                                    className="!relative !top-0 !right-0 !w-12 !h-12 !bg-white/10 !backdrop-blur-md border border-white/20"
                                />
                            </motion.div>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <div className="absolute top-0 left-full ml-6 z-[2000]">
                                        <FilterPanel
                                            isOpen={true}
                                            onClose={() => setIsFilterOpen(false)}
                                            selectedTypes={selectedTypes}
                                            toggleType={toggleType}
                                            selectedRegions={selectedRegions}
                                            toggleRegion={toggleRegion}
                                            minElevation={minElevation}
                                            setMinElevation={setMinElevation}
                                            onReset={handleReset}
                                            className="!relative !top-0 !left-0 w-80 shadow-2xl border-white/10"
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Minimal Stats - Responsive positioning */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="absolute bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 text-white/60 text-sm z-10 w-full justify-center"
                    >
                        <div className="text-center">
                            <div className="text-xl font-semibold text-white/90 mb-1">
                                {totalLocations}
                            </div>
                            <div className="text-xs">Locations</div>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="text-center">
                            <div className="text-xl font-semibold text-white/90 mb-1">
                                {countries}
                            </div>
                            <div className="text-xs">Countries</div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
