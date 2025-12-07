import { motion } from 'framer-motion';
import { Mountain } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-black text-white">
            {/* 4K Mountain Background with overlay */}
            <div className="fixed inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=3840&auto=format&fit=crop"
                    alt="Mountain Background"
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
                <Link to="/map" className="px-5 py-2 bg-white text-black font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                    Explore Map
                </Link>
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
                            The Himalayas is an interactive exploration platform designed to showcase the beauty,
                            scale, and geography of the world's highest mountain range.
                        </p>
                        <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                            Born from a love for cartography and alpinism, this project aims to provide a digital
                            sanctuary for those who dream of the high peaks. We combine modern web technologies
                            with curated geographical data to create an immersive experience that feels as premium
                            as the landscapes it represents.
                        </p>
                    </section>

                    {/* Social Links */}
                    <section className="glass-overlay-dark rounded-3xl p-8 md:p-12">
                        <h3 className="text-xl font-bold mb-6 text-white">Connect</h3>
                        <p className="text-gray-300 mb-6">
                            Explore the source code, contribute to the project, or share your own Himalayan experiences.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                View on GitHub
                            </a>
                            <Link
                                to="/map"
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors font-medium"
                            >
                                Explore Map
                            </Link>
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
