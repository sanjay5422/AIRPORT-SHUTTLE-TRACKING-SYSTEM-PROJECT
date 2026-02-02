import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, Truck, DollarSign, Activity, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
        hover: { scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/analytics/dashboard', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats, using mock data", err);
                setStats({
                    totalPassengers: 1240,
                    totalDrivers: 45,
                    activeTrips: 12,
                    totalRevenue: 15400,
                    revenueData: [
                        { name: 'Mon', revenue: 4000, active: 2400 },
                        { name: 'Tue', revenue: 3000, active: 1398 },
                        { name: 'Wed', revenue: 5000, active: 3800 },
                        { name: 'Thu', revenue: 2780, active: 3908 },
                        { name: 'Fri', revenue: 1890, active: 4800 },
                        { name: 'Sat', revenue: 2390, active: 3800 },
                        { name: 'Sun', revenue: 3490, active: 4300 },
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-xl animate-pulse"
                >
                    <div className="mb-8 p-6 bg-darksurface/80 rounded-2xl shadow-glass-lg flex items-center justify-between border border-gray-700/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
                            <div>
                                <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-gray-700 rounded w-32"></div>
                            </div>
                        </div>
                        <div className="h-8 bg-gray-700 rounded-full w-40"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-darkcard/50 rounded-2xl p-6 shadow-glass border border-gray-800 h-32"></div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-darkcard/50 rounded-2xl p-6 shadow-glass border border-gray-800 h-[400px]"></div>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            gradient: 'from-emerald-400 to-emerald-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            trend: '+12.5%'
        },
        {
            title: 'Active Trips',
            value: stats.activeTrips,
            icon: Activity,
            gradient: 'from-blue-400 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            trend: '+8.2%'
        },
        {
            title: 'Total Passengers',
            value: stats.totalPassengers.toLocaleString(),
            icon: Users,
            gradient: 'from-purple-400 to-purple-600',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            trend: '+23.1%'
        },
        {
            title: 'Fleet Size',
            value: stats.totalDrivers,
            icon: Truck,
            gradient: 'from-orange-400 to-orange-600',
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            trend: '+5.3%'
        },
    ];

    return (
        <motion.div
            className="space-y-8 p-4"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
        >
            {/* Header */}
            <motion.div
                className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-8 flex flex-col md:flex-row items-start md:items-center justify-between border border-gray-700/50"
                variants={cardVariants}
                whileHover="hover"
            >
                <div className="mb-4 md:mb-0">
                    <h1 className="text-4xl font-bold text-darktext mb-2 tracking-tight">Analytics Overview</h1>
                    <p className="text-lg text-gray-400">Monitor your system performance and fleet metrics in real-time.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <motion.button
                        className="px-6 py-2.5 rounded-xl bg-darkcard text-gray-300 border border-gray-700 font-semibold shadow-sm hover:bg-gray-700 transition"
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Export Report
                    </motion.button>
                    <motion.button
                        className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Manage Fleet
                    </motion.button>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-6 relative overflow-hidden border border-gray-700/50"
                        variants={cardVariants}
                        whileHover="hover"
                        transition={{ delay: 0.1 * index }}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10 group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br ${card.gradient}`}></div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg text-white group-hover:scale-105 transition-transform duration-300`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-sm font-bold text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded-full border border-emerald-700">
                                <TrendingUp className="w-3 h-3" />
                                {card.trend}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">{card.title}</p>
                            <h3 className="text-3xl font-bold text-darktext">{card.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <motion.div
                    className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-8 border border-gray-700/50"
                    variants={cardVariants}
                    whileHover="hover"
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-darktext">Revenue Trends</h3>
                            <p className="text-sm text-gray-400">Daily financial performance</p>
                        </div>
                        <div className="p-2 bg-primary-950 rounded-lg text-primary-400 shadow-inner">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.revenueData} barSize={40}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3730a3" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a5b4fc', fontSize: 13, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a5b4fc', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#1e1b4b' }}
                                    contentStyle={{
                                        borderRadius: '1rem',
                                        border: 'none',
                                        background: '#1e1b4b',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                                        padding: '12px 20px',
                                        color: '#e0e0e0'
                                    }}
                                />
                                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Activity Chart */}
                <motion.div
                    className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-8 border border-gray-700/50"
                    variants={cardVariants}
                    whileHover="hover"
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-darktext">Weekly Activity</h3>
                            <p className="text-sm text-gray-400">Passenger volume analysis</p>
                        </div>
                        <div className="p-2 bg-secondary-950 rounded-lg text-secondary-400 shadow-inner">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueData}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3730a3" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a5b4fc', fontSize: 13, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a5b4fc', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '1rem',
                                        border: 'none',
                                        background: '#1e1b4b',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                                        padding: '12px 20px',
                                        color: '#e0e0e0'
                                    }}
                                />
                                <Area type="monotone" dataKey="active" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" animationDuration={2000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Summary Grid */}
            <motion.div
                className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-8 border border-gray-700/50"
                variants={cardVariants}
                whileHover="hover"
                transition={{ delay: 0.7 }}
            >
                <h3 className="text-xl font-bold text-darktext mb-6">Efficiency Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Avg. Revenue / Day', val: `$${Math.round(stats.totalRevenue / 7)}`, color: 'text-emerald-400', bg: 'bg-emerald-900/50' },
                        { label: 'Passengers / Driver', val: Math.round(stats.totalPassengers / stats.totalDrivers), color: 'text-blue-400', bg: 'bg-blue-900/50' },
                        { label: 'Trip Completion Rate', val: '94.2%', color: 'text-purple-400', bg: 'bg-purple-900/50' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className={`p-6 rounded-2xl ${item.bg} border border-gray-800 flex flex-col items-center justify-center text-center shadow-inner`}
                            variants={itemVariants}
                            transition={{ delay: 0.8 + i * 0.1 }}
                        >
                            <p className="text-gray-400 font-medium mb-2">{item.label}</p>
                            <p className={`text-3xl font-bold ${item.color}`}>{item.val}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboard;