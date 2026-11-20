import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, FileText, Calendar, Map, Share2, Check, Copy, Quote, Scroll, Building, Globe, BookOpen, Languages, Clock } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { CitationModal } from '../components/location/CitationModal';
import { usePageTitle } from '../hooks/usePageTitle';
import { haversineKm, mapUrl } from '../lib/sites';
import type { Location } from '../types';

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
    const [coordsCopied, setCoordsCopied] = useState(false);

    // Determine location: Prefer live data, fallback to passed state (instant load), then 404
    const location: Location | undefined = state?.location || locations.find(l => l.id === id);
    usePageTitle(location ? `${location.name} (${location.entry_no})` : 'Site not found');

    // Moving between sites keeps this page mounted, so start each one at the top
    useEffect(() => window.scrollTo(0, 0), [id]);

    // Previous and next in the order of the dataset (entry number)
    const index = locations.findIndex(l => l.id === location?.id);
    const previous = index > 0 ? locations[index - 1] : undefined;
    const next = index >= 0 ? locations[index + 1] : undefined;

    // Parallax for hero image
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    // The five nearest mapped sites; for a site without coordinates, others in its district
    const origin = location?.coordinates;
    const related: { site: Location; km: number | null }[] = !location ? [] : origin
        ? locations
            .filter(l => l.coordinates && l.id !== location.id)
            .map(site => ({ site, km: haversineKm(origin, site.coordinates!) }))
            .sort((a, b) => a.km - b.km)
            .slice(0, 5)
        : locations
            .filter(l => l.region === location.region && l.id !== location.id)
            .slice(0, 5)
            .map(site => ({ site, km: null }));

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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Site not found</h1>
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

    const coordsText = location.coordinates
        ? `${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}`
        : '';

    const handleCopyCoords = async () => {
        await navigator.clipboard.writeText(coordsText);
        setCoordsCopied(true);
        setTimeout(() => setCoordsCopied(false), 2000);
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
                day: 'numeric',
                timeZone: 'UTC'
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
                    aria-label="Back"
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-colors pointer-events-auto"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2 pointer-events-auto">
                    <button
                        onClick={() => setShowCitation(true)}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-colors flex items-center justify-center gap-2 group"
                        title="Cite this site"
                        aria-label="Cite this site"
                    >
                        <Quote className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-colors flex items-center justify-center gap-2"
                        title="Share this site"
                        aria-label="Share this site"
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
                        alt=""
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

                    {/* Previous / next site, in dataset order */}
                    <nav aria-label="Previous and next site" className="lg:col-span-3 lg:order-last flex justify-between gap-4 border-t border-gray-200 pt-6">
                        {previous ? (
                            <Link to={`/locations/${previous.id}`} className="flex items-center gap-2 text-gray-700 hover:text-black min-w-0">
                                <ArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                <span className="min-w-0">
                                    <span className="block text-xs text-gray-500">Previous · {previous.entry_no}</span>
                                    <span className="block font-medium truncate">{previous.name}</span>
                                </span>
                            </Link>
                        ) : <span />}
                        {next && (
                            <Link to={`/locations/${next.id}`} className="flex items-center gap-2 text-right text-gray-700 hover:text-black min-w-0">
                                <span className="min-w-0">
                                    <span className="block text-xs text-gray-500">Next · {next.entry_no}</span>
                                    <span className="block font-medium truncate">{next.name}</span>
                                </span>
                                <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            </Link>
                        )}
                    </nav>

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
                                {location.coordinates ? (
                                    <div className="py-2 border-b border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Coordinates</span>
                                            <span className="font-mono text-gray-900 text-xs">{coordsText}</span>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 mt-2 text-xs font-medium">
                                            <button onClick={handleCopyCoords} className="flex items-center gap-1 text-blue-700 hover:underline">
                                                {coordsCopied ? <Check className="w-3 h-3" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
                                                <span aria-live="polite">{coordsCopied ? 'Copied' : 'Copy coordinates'}</span>
                                            </button>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-700 hover:underline"
                                            >
                                                Google Maps
                                            </a>
                                            <a
                                                href={`https://www.openstreetmap.org/?mlat=${location.coordinates.lat}&mlon=${location.coordinates.lng}#map=16/${location.coordinates.lat}/${location.coordinates.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-700 hover:underline"
                                            >
                                                OpenStreetMap
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-500 text-sm">Coordinates</span>
                                        <span className="text-gray-700 text-sm">Not recorded</span>
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
                        <Link
                            to={mapUrl({ site: location.id })}
                            className="block bg-black text-white p-6 rounded-2xl relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <Map className="w-8 h-8 mb-3 text-amber-500" />
                                <h3 className="text-xl font-bold mb-2">View on Map</h3>
                                <p className="text-white/60 text-sm mb-4">
                                    {location.coordinates ? 'See this site among its neighbours' : 'This site has no coordinates, so it has no marker'}
                                </p>
                                <span className="inline-block px-4 py-2 bg-white text-black font-bold rounded-full text-sm group-hover:bg-amber-500 transition-colors">
                                    Launch Map
                                </span>
                            </div>
                            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
                        </Link>

                        {/* Nearby sites, or the rest of the district when this site has no coordinates */}
                        {related.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">
                                    {location.coordinates ? 'Sites nearby' : `Other sites in ${location.region}`}
                                </h3>
                                <ul className="space-y-2">
                                    {related.map(({ site, km }) => (
                                        <li key={site.id}>
                                            <Link
                                                to={`/locations/${site.id}`}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                                            >
                                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Building className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-gray-900 truncate">{site.name}</h4>
                                                    <p className="text-xs text-gray-500 truncate">{site.entry_no} · {site.type}</p>
                                                </div>
                                                {km !== null && (
                                                    <span className="text-xs font-mono text-gray-500 flex-shrink-0">
                                                        {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationDetailsPage;
