import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, MapPin, FileText, Calendar, Map, Share2, Check, Quote, Scroll, Building } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { CitationModal } from '../components/location/CitationModal';

// Default placeholder image for historical sites
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600';

const LocationDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { scrollY } = useScroll();
    const { locations, loading } = useLocations();

    // All hooks must be at the top before any conditional logic
    const [showCitation, setShowCitation] = useState(false);
    const [copied, setCopied] = useState(false);

    // Determine location: Prefer live data, fallback to passed state (instant load), then 404
    const location = state?.location || locations.find(l => l.id === id);

    // Parallax for hero image
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Find related locations in same district (computed before conditional returns)
    const relatedLocations = location ? locations.filter(l =>
        (l.region === location.region && l.id !== location.id)
    ).slice(0, 3) : [];

    // If we have no location data AND we are loading, show spinner.
    if (loading && !location) {
        return (
            <div className="min-h-screen bg-white">
                {/* Skeleton Hero */}
                <div className="h-[70vh] bg-gray-200 animate-pulse relative">
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                        <div className="max-w-7xl mx-auto space-y-4">
                            <div className="w-32 h-6 bg-gray-300 rounded-full" />
                            <div className="w-3/4 md:w-1/2 h-16 bg-gray-300 rounded-xl" />
                            <div className="flex gap-4">
                                <div className="w-24 h-6 bg-gray-300 rounded-full" />
                                <div className="w-24 h-6 bg-gray-300 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Skeleton Content */}
                <div className="max-w-7xl mx-auto -mt-10 relative z-10 px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-8 pt-12">
                        <div className="space-y-4">
                            <div className="w-1/4 h-8 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
                            <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
                            <div className="w-3/4 h-4 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="hidden lg:block lg:col-span-1 pt-12">
                        <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!location) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Location not found</h2>
                    <button
                        onClick={() => navigate('/map')}
                        className="text-blue-600 hover:underline"
                    >
                        Return to Map
                    </button>
                </div>
            </div>
        );
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${location.name} - Khasa Malla Historical Site`,
                    text: `Explore ${location.name}, a ${location.type} from the Khasa Malla era.`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleViewOnMap = () => {
        navigate('/map', {
            state: {
                selectedLocation: location,
                searchQuery: location.name
            }
        });
    };

    return (
        <div className="min-h-screen bg-white">
            <CitationModal location={location} isOpen={showCitation} onClose={() => setShowCitation(false)} />

            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-colors pointer-events-auto"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2 pointer-events-auto">
                    <button
                        onClick={() => setShowCitation(true)}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-colors flex items-center justify-center gap-2 group"
                        title="Cite this location"
                    >
                        <Quote className="w-5 h-5" />
                        <span className="hidden md:block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-sm font-medium pr-1">
                            Cite
                        </span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-colors flex items-center justify-center gap-2"
                        title="Share location"
                    >
                        {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative h-[70vh] w-full overflow-hidden bg-black">
                <motion.div style={{ y, opacity }} className="absolute inset-0 h-full w-full">
                    <img
                        src={PLACEHOLDER_IMAGE}
                        alt={location.name}
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-7xl mx-auto"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-full">
                                {location.type}
                            </span>
                            <span className="text-white/80 text-sm font-medium flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {location.region}, {location.country}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                            {location.name}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-white/70">
                            {location.entry_no && (
                                <span className="flex items-center gap-2">
                                    <Scroll className="w-5 h-5" />
                                    Entry: {location.entry_no}
                                </span>
                            )}
                            {location.phase && (
                                <span className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Phase {location.phase}
                                </span>
                            )}
                            {location.visit_date && (
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Visited: {location.visit_date}
                                </span>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="relative z-30 bg-white -mt-10 rounded-t-3xl min-h-screen px-6 py-12 md:px-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        {location.description && (
                            <section>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-amber-500" />
                                    Description
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {location.description}
                                </p>
                            </section>
                        )}

                        {/* Documentation */}
                        {location.documentation && (
                            <section>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Scroll className="w-6 h-6 text-amber-500" />
                                    Field Documentation
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-2xl">
                                    <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {location.documentation}
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Source */}
                        {location.source && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Sources</h3>
                                <p className="text-gray-500 italic">
                                    {location.source}
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Quick Stats */}
                        <div className="bg-gray-50 p-8 rounded-3xl">
                            <h3 className="font-bold text-gray-900 mb-6">Quick Facts</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <span className="text-gray-500">Entry ID</span>
                                    <span className="font-medium text-gray-900">{location.entry_no || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <span className="text-gray-500">Country</span>
                                    <span className="font-medium text-gray-900">{location.country}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <span className="text-gray-500">District</span>
                                    <span className="font-medium text-gray-900">{location.region}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <span className="text-gray-500">Type</span>
                                    <span className="font-medium text-gray-900">{location.type}</span>
                                </div>
                                {location.coordinates && (
                                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                        <span className="text-gray-500">Coordinates</span>
                                        <span className="font-medium text-gray-900 text-sm">
                                            {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                                        </span>
                                    </div>
                                )}
                                {location.phase && (
                                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                        <span className="text-gray-500">Research Phase</span>
                                        <span className="font-medium text-gray-900">Phase {location.phase}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Map Button */}
                        <div
                            className="bg-black text-white p-8 rounded-3xl relative overflow-hidden group cursor-pointer"
                            onClick={handleViewOnMap}
                        >
                            <div className="relative z-10">
                                <Map className="w-8 h-8 mb-4 text-amber-500" />
                                <h3 className="text-2xl font-bold mb-2">View on Map</h3>
                                <p className="text-white/60 mb-6">Explore {location.name} in 3D interactive mode.</p>
                                <span className="inline-block px-4 py-2 bg-white text-black font-bold rounded-full text-sm group-hover:bg-amber-500 transition-colors">
                                    Launch Map
                                </span>
                            </div>
                            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        {/* Related Locations in Same District */}
                        {relatedLocations.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Sites in {location.region}</h3>
                                <div className="space-y-3">
                                    {relatedLocations.map(rel => (
                                        <div
                                            key={rel.id}
                                            onClick={() => navigate(`/locations/${rel.id}`)}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <Building className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{rel.name}</h4>
                                                <p className="text-xs text-gray-500">{rel.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationDetailsPage;
