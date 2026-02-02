import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Users, Car, Calendar } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800 p-6 rounded-2xl border border-gray-700"
    >
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        {subtext && <p className="text-sm text-gray-400">{subtext}</p>}
    </motion.div>
);

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/analytics/dashboard', {
                    headers: { 'x-auth-token': token }
                });
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Analytics...</div>;
    if (!data) return <div className="p-8 text-center text-red-400">Failed to load data</div>;

    const chartData = data.revenue.trend.map(item => ({
        date: item._id,
        revenue: item.total
    }));

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400 mb-8">Overview of system performance and revenue</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`$${data.revenue.total}`}
                    subtext="Lifetime earnings"
                    icon={DollarSign}
                    color="bg-emerald-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={data.bookings.total}
                    subtext={`${data.bookings.completed} completed`}
                    icon={Calendar}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Total Users"
                    value={data.users.passengers + data.users.drivers}
                    subtext={`${data.users.drivers} drivers`}
                    icon={Users}
                    color="bg-purple-600"
                />
                <StatCard
                    title="Active Fleet"
                    value={`${data.fleet.active}/${data.fleet.total}`}
                    subtext="Vehicles currently active"
                    icon={Car}
                    color="bg-orange-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-6">Revenue Trend (Last 7 Days)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#10B981' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-6">Booking Status Distribution</h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        {/* Placeholder for Pie Chart if rehcarts supports it or just use simple stats */}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Completed', value: data.bookings.completed },
                                { name: 'Cancelled', value: data.bookings.cancelled },
                                { name: 'Active', value: data.bookings.active },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                                <Bar dataKey="value" fill="#3B82F6" barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
