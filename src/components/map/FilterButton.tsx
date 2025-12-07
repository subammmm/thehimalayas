import { Filter } from 'lucide-react';

interface FilterButtonProps {
    onClick: () => void;
    activeCount: number;
}

export const FilterButton = ({ onClick, activeCount }: FilterButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="absolute top-6 right-6 z-[1000] glass-overlay w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/90 transition-all hover:scale-105 shadow-lg pointer-events-auto group"
        >
            <Filter className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors" />
            {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                    {activeCount}
                </span>
            )}
        </button>
    );
};
