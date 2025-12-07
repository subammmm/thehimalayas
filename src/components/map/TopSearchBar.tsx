import { Search } from 'lucide-react';

interface TopSearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export const TopSearchBar = ({ value, onChange }: TopSearchBarProps) => {
    return (
        <div className="absolute top-6 left-0 right-0 z-[1000] flex justify-center pointer-events-none px-4">
            <div className="pointer-events-auto w-full max-w-md glass-overlay !rounded-full flex items-center p-3 pl-5 shadow-lg transition-transform hover:scale-[1.02]">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search locations..."
                    className="bg-transparent border-none outline-none flex-grow text-gray-800 placeholder-gray-400 font-medium"
                />
            </div>
        </div>
    );
};
