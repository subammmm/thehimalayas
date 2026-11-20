import { motion } from 'framer-motion';
import { Mountain } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocations } from '../hooks/useLocations';
import { usePageTitle } from '../hooks/usePageTitle';
import { mapUrl } from '../lib/sites';

const AboutPage = () => {
    const navigate = useNavigate();
    const { locations } = useLocations();
    usePageTitle('About');
    const mappedCount = locations.filter(loc => loc.coordinates).length;

    const handleExplore = () => {
        const mapped = locations.filter(loc => loc.coordinates);
        navigate(mapUrl({ site: mapped[Math.floor(Math.random() * mapped.length)]?.id }));
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-black text-white">
            {/* 4K Mountain Background with overlay */}
            <div className="fixed inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=3840&auto=format&fit=crop"
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
            </div>

            {/* Header */}
            <nav className="relative z-50 p-6 md:p-10 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-white hover:text-amber-500 transition-colors">
                    <Mountain className="w-8 h-8" />
                    <span className="font-bold text-xl tracking-wider">THE HIMALAYAS</span>
                </Link>
                <button
                    onClick={handleExplore}
                    className="px-5 py-2 bg-white text-black font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                >
                    Explore Map
                </button>
            </nav>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl md:text-8xl font-bold mb-12 tracking-tight">
                        About
                    </h1>
                </motion.div>

                <div className="space-y-16">
                    <section className="space-y-8 glass-overlay-dark rounded-3xl p-8 md:p-12">
                        <p className="text-2xl md:text-3xl font-light text-gray-200 leading-relaxed">
                            The Himalayas is a digital atlas of historical sites of the Khasa Malla kingdom
                            (12th to 14th century) across western Nepal, India and Tibet.
                        </p>
                        <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                            It records {locations.length} sites: pillars, steles, devals, stupas, temples, fountains
                            and inscriptions. {mappedCount} have recorded coordinates and appear on the map. The
                            others are listed with the information available, and can be found through search and
                            the <Link to="/browse" className="underline hover:text-white">browse page</Link>.
                        </p>
                        <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                            Each record keeps its field notes and names the source it draws on. Records carry the
                            date of the site visit where there was one. The monuments themselves are not
                            individually dated in the dataset, so the atlas does not present a timeline.
                        </p>
                    </section>

                    {/* Social Links */}
                    <section className="glass-overlay-dark rounded-3xl p-8 md:p-12">
                        <h2 className="text-xl font-bold mb-6 text-white">Data and code</h2>
                        <p className="text-gray-300 mb-6">
                            The dataset is open to download from the <Link to="/data" className="underline hover:text-white">data page</Link>,
                            and the source code is on GitHub.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://github.com/subammmm/thehimalayas"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                View on GitHub
                            </a>
                            <button
                                onClick={handleExplore}
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors font-medium cursor-pointer"
                            >
                                Explore Map
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Bottom gradient */}
            <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-0" />
        </div>
    );
};

export default AboutPage;
