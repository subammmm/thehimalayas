import { motion } from 'framer-motion';
import { X, ExternalLink, Box, MapPin, Mountain } from 'lucide-react';
import type { Location } from '../../types';
import { useNavigate } from 'react-router-dom';

interface LocationPopoverProps {
    location: Location | null;
    onClose: () => void;
    on3DView: () => void;
}

export const LocationPopover = ({ location, onClose, on3DView }: LocationPopoverProps) => {
    const navigate = useNavigate();
    if (!location) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="hidden md:flex absolute top-20 left-20 z-[1100] w-96 glass-panel rounded-2xl overflow-hidden flex-col shadow-2xl max-h-[calc(100vh-100px)] pointer-events-auto"
        >
            <div className="relative h-48 w-full flex-shrink-0">
                <img
                    src={location.images[0]}
                    alt={location.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent" />
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                            {location.type}
                        </span>
                        <span className="text-xs font-medium opacity-80 flex items-center">
                            <Mountain className="w-3 h-3 mr-1" />
                            {location.elevation}m
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight">{location.name}</h2>
                    <p className="text-sm opacity-80 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {location.region} Region
                    </p>
                </div>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar">
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {location.description}
                </p>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {location.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gallery</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {/* Just reusing main image for mock gallery feel if multiple dont exist, or use placeholder */}
                            <img src={location.images[0]} className="w-full h-24 object-cover rounded-lg" />
                            <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400" className="w-full h-24 object-cover rounded-lg" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => navigate(`/locations/${location.id}`)}
                        className="flex-1 bg-black text-white py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        Details
                        <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                        onClick={on3DView}
                        className="flex-1 bg-white border border-gray-200 text-gray-800 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        3D View
                        <Box className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
