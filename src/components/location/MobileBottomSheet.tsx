
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { X, MapPin, Mountain } from 'lucide-react';
import type { Location } from '../../types';
import { useNavigate } from 'react-router-dom';

interface MobileBottomSheetProps {
    location: Location | null;
    onClose: () => void;
    on3DView: () => void;
}

export const MobileBottomSheet = ({ location, onClose, on3DView }: MobileBottomSheetProps) => {
    const navigate = useNavigate();
    // Simple drag logic could be improved but sufficient for "works"
    const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100) {
            onClose();
        }
    };

    if (!location) return null;

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={onDragEnd}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[1200] bg-white rounded-t-3xl shadow-[0_-5px_40px_rgba(0,0,0,0.1)] h-[85vh] flex flex-col pointer-events-auto"
        >
            {/* Drag Handle */}
            <div className="w-full h-8 flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing border-b border-gray-100"
                onTouchStart={() => {
                    // simple touch handler placeholder
                }}
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-0 pb-10">
                <div className="relative h-64 w-full">
                    <img
                        src={location.images[0]}
                        alt={location.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white pt-20">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-[10px] font-bold uppercase tracking-wider">
                                {location.type}
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold">{location.name}</h2>
                        <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
                            <span className="flex items-center"><Mountain className="w-4 h-4 mr-1" /> {location.elevation}m</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {location.region}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-gray-600 text-lg leading-relaxed">
                        {location.description}
                    </p>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {location.tags.map(tag => (
                                <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => navigate(`/locations/${location.id}`)}
                            className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors"
                        >
                            Details
                        </button>
                        <button
                            onClick={on3DView}
                            className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
                        >
                            3D View
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
