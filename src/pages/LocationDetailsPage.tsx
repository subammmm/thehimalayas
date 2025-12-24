import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, MapPin, FileText, Calendar, Map, Share2, Check, Quote, Scroll, Building, Globe, BookOpen, Languages, Clock } from 'lucide-react';
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

    const [showCitation, setShowCitation] = useState(false);
    const [copied, setCopied] = useState(false);

    // Determine location: Prefer live data, fallback to passed state (instant load), then 404
    const location = state?.location || locations.find(l => l.id === id);

    // Parallax for hero image
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Find related locations in same district
    const relatedLocations = location ? locations.filter(l =>
        (l.region === location.region && l.id !== location.id)
    ).slice(0, 4) : [];

    // Loading skeleton
    if (loading && !location) {
        return (
            <div className="min-h-screen bg-white">
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

    // Format visit date nicely
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
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
            <div className="relative h-[60vh] w-full overflow-hidden bg-black">
                <motion.div style={{ y, opacity }} className="absolute inset-0 h-full w-full">
                    <img
                        src={PLACEHOLDER_IMAGE}
                        alt={location.name}
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-7xl mx-auto"
                    >
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-full">
                                {location.type}
                            </span>
                            <span className="text-white/80 text-sm font-medium flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {location.region}, {location.country}
                            </span>
                            {location.entry_no && (
                                <span className="text-white/60 text-sm font-mono">
                                    #{location.entry_no}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                            {location.name}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-white/70 text-sm">
                            {location.phase && (
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                    <Building className="w-4 h-4" />
                                    Research Phase {location.phase}
                                </span>
                            )}
                            {location.visit_date && (
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(location.visit_date)}
                                </span>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="relative z-30 bg-white -mt-6 rounded-t-3xl min-h-screen px-6 py-12 md:px-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Description */}
                        {location.description && (
                            <section className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                    Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {location.description}
                                </p>
                            </section>
                        )}

                        {/* Field Documentation */}
                        {location.documentation && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Scroll className="w-5 h-5 text-amber-600" />
                                    Field Documentation
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {location.documentation}
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Language & Translation */}
                        {(location.language || location.translation) && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Languages className="w-5 h-5 text-amber-600" />
                                    Inscriptions & Language
                                </h3>
                                <div className="space-y-4">
                                    {location.language && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Script / Language</span>
                                            <p className="text-gray-800 mt-1">{location.language}</p>
                                        </div>
                                    )}
                                    {location.translation && (
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Translation</span>
                                            <p className="text-gray-800 mt-2 italic leading-relaxed">"{location.translation}"</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Sources & References */}
                        {location.source && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-amber-600" />
                                    Sources & References
                                </h3>
                                <div className="bg-gray-100 p-4 rounded-xl">
                                    <p className="text-gray-600 text-sm italic leading-relaxed">
                                        {location.source}
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Facts Card */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-gray-600" />
                                Site Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-500 text-sm">Entry ID</span>
                                    <span className="font-medium text-gray-900 font-mono text-sm">{location.entry_no || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-500 text-sm">Country</span>
                                    <span className="font-medium text-gray-900">{location.country}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-500 text-sm">District</span>
                                    <span className="font-medium text-gray-900">{location.region}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-500 text-sm">Site Type</span>
                                    <span className="font-medium text-gray-900 text-right max-w-[150px]">{location.type}</span>
                                </div>
                                {location.coordinates && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-500 text-sm">Coordinates</span>
                                        <span className="font-mono text-gray-900 text-xs">
                                            {location.coordinates.lat.toFixed(4)}°N, {location.coordinates.lng.toFixed(4)}°E
                                        </span>
                                    </div>
                                )}
                                {location.phase && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-500 text-sm">Research Phase</span>
                                        <span className="font-medium text-gray-900">Phase {location.phase}</span>
                                    </div>
                                )}
                                {location.visit_date && (
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-500 text-sm flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Visited
                                        </span>
                                        <span className="font-medium text-gray-900 text-sm">{location.visit_date}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* View on Map Button */}
                        <div
                            className="bg-black text-white p-6 rounded-2xl relative overflow-hidden group cursor-pointer"
                            onClick={handleViewOnMap}
                        >
                            <div className="relative z-10">
                                <Map className="w-8 h-8 mb-3 text-amber-500" />
                                <h3 className="text-xl font-bold mb-2">View on Map</h3>
                                <p className="text-white/60 text-sm mb-4">Explore in 3D interactive mode</p>
                                <span className="inline-block px-4 py-2 bg-white text-black font-bold rounded-full text-sm group-hover:bg-amber-500 transition-colors">
                                    Launch Map
                                </span>
                            </div>
                            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        {/* Related Sites */}
                        {relatedLocations.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Other Sites in {location.region}</h3>
                                <div className="space-y-2">
                                    {relatedLocations.map(rel => (
                                        <div
                                            key={rel.id}
                                            onClick={() => navigate(`/locations/${rel.id}`, { state: { location: rel } })}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                                        >
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Building className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{rel.name}</h4>
                                                <p className="text-xs text-gray-500 truncate">{rel.type}</p>
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
