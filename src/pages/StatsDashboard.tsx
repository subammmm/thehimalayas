import { ArrowLeft, BarChart2, MapPin, Mountain, Globe, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../hooks/useLocations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const StatsDashboard = () => {
    const navigate = useNavigate();
    const { locations, loading } = useLocations();

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Loading Data...</div>;
    }

    // 1. Elevation Stats
    const sortedByElevation = [...locations]
        .filter(l => l.elevation)
        .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
        .slice(0, 10);

    const elevationData = sortedByElevation.map(l => ({
        name: l.name,
        elevation: l.elevation,
    }));

    // 2. Region Distribution
    const regions = locations.reduce((acc, curr) => {
        const region = curr.region || 'Unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const regionData = Object.entries(regions).map(([name, count]) => ({
        name,
        value: count
    }));

    // 3. Type Distribution
    const types = locations.reduce((acc, curr) => {
        const type = curr.type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(types).map(([name, count]) => ({
        name,
        value: count
    }));

    const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-white/50 backdrop-blur-md border-b border-gray-200">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>
                <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-gray-900">Research & Analytics</span>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Himalayan Dataset Analysis</h1>
                    <p className="text-xl text-gray-600 max-w-3xl">
                        Statistical breakdown of {locations.length} documented locations across the Himalayan range,
                        analyzing elevation profiles, regional distribution, and geographical classification.
                    </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-gray-500 text-sm font-medium">
                            <MapPin className="w-4 h-4" /> Total Locations
                        </div>
                        <p className="text-4xl font-bold text-gray-900">{locations.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-gray-500 text-sm font-medium">
                            <Mountain className="w-4 h-4" /> Average Elevation
                        </div>
                        <p className="text-4xl font-bold text-gray-900">
                            {Math.round(locations.reduce((acc, curr) => acc + (curr.elevation || 0), 0) / locations.length).toLocaleString()}m
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-gray-500 text-sm font-medium">
                            <Globe className="w-4 h-4" /> Regions Covered
                        </div>
                        <p className="text-4xl font-bold text-gray-900">{Object.keys(regions).length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-gray-500 text-sm font-medium">
                            <Info className="w-4 h-4" /> Dataset Version
                        </div>
                        <p className="text-4xl font-bold text-gray-900">v1.2.0</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Elevation Chart */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Top 10 Highest Peaks</h3>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={elevationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="elevation" radius={[4, 4, 0, 0]}>
                                        {elevationData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Region Distribution */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Regional Distribution</h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={regionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                    >
                                        {regionData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Type Distribution */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Location Types</h3>
                        <div className="space-y-4">
                            {typeData.map((type, index) => (
                                <div key={type.name} className="flex items-center">
                                    <div className="w-32 text-sm font-medium text-gray-600">{type.name}</div>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${(type.value / locations.length) * 100}%`,
                                                backgroundColor: COLORS[index % COLORS.length]
                                            }}
                                        />
                                    </div>
                                    <div className="w-12 text-right text-sm font-bold text-gray-900">{type.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
