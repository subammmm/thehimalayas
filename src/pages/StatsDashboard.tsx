import { motion } from 'framer-motion';
import { ArrowLeft, BarChart2, MapPin, Mountain, Globe, TrendingUp, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../hooks/useLocations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function StatsDashboard() {
    const navigate = useNavigate();
    const { locations } = useLocations();

    // Data Processing
    const totalLocations = locations.length;
    const avgElevation = Math.round(locations.reduce((acc, curr) => acc + (curr.elevation || 0), 0) / locations.length);
    const regions = new Set(locations.map(l => l.region)).size;

    const sortedByElevation = [...locations]
        .filter(l => l.elevation)
        .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
        .slice(0, 8);

    const regionCounts = locations.reduce((acc, curr) => {
        if (curr.region) acc[curr.region] = (acc[curr.region] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const regionData = Object.entries(regionCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const typeCounts = locations.reduce((acc, curr) => {
        if (curr.type) acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(typeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Aesthetics
    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#6366f1'];
    const CARD_STYLE = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors duration-300";

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-white/20 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-white font-medium text-sm">{label}</p>
                    <p className="text-emerald-400 text-xs font-bold mt-1">
                        {payload[0].value.toLocaleString()} {payload[0].dataKey === 'elevation' ? 'meters' : 'locations'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
                >
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium mb-2 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return Home
                        </button>
                        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                            Himalayan Atlas
                        </h1>
                        <p className="text-white/60 max-w-lg text-lg font-light">
                            Deep insights into the world's highest peaks, valleys, and sacred regions.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Dataset Version</div>
                            <div className="text-emerald-400 font-mono">v2.4.0 (Live)</div>
                        </div>
                    </div>
                </motion.div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Locations', value: totalLocations, icon: MapPin, color: 'text-blue-400' },
                        { label: 'Avg Elevation', value: `${avgElevation.toLocaleString()}m`, icon: TrendingUp, color: 'text-emerald-400' },
                        { label: 'Regions Covered', value: regions, icon: Globe, color: 'text-purple-400' },
                        { label: 'Terrain Types', value: typeData.length, icon: Layers, color: 'text-amber-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={CARD_STYLE}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                            </div>
                            <div className="text-2xl md:text-4xl font-bold font-display">{stat.value}</div>
                            <div className="text-xs text-white/40 font-medium uppercase tracking-wider mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Peaks */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className={`${CARD_STYLE} lg:col-span-2 min-h-[400px]`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Mountain className="w-5 h-5 text-emerald-400" />
                                    Highest Peaks
                                </h3>
                                <p className="text-sm text-white/40">Top 8 elevations in the dataset</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sortedByElevation} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="elevation" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                        {sortedByElevation.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} fillOpacity={0.9} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Regional Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className={CARD_STYLE}
                    >
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-400" />
                            Regional Coverage
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={regionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {regionData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center mt-4">
                            {regionData.slice(0, 5).map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2 text-xs text-white/60">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Terrain Types */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className={CARD_STYLE}
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-purple-400" />
                            Terrain Composition
                        </h3>
                        <div className="space-y-4">
                            {typeData.map((item, index) => (
                                <div key={item.name} className="group">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white/70 group-hover:text-white transition-colors">{item.name}</span>
                                        <span className="font-mono text-emerald-400">{item.value}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.value / totalLocations) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
