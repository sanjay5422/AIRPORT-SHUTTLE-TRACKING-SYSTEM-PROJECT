import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Map, MapPin, Clock, Calendar, Plus, Navigation } from 'lucide-react';

const RouteManager = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRoute, setNewRoute] = useState({
        name: '',
        startPoint: { name: '', coordinates: { lat: 0, lng: 0 } },
        endPoint: { name: '', coordinates: { lat: 0, lng: 0 } },
        distanceKm: 0,
        estimatedDurationMins: 0
    });

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/routes');
            setRoutes(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/routes', newRoute, {
                headers: { 'x-auth-token': token }
            });
            setShowAddModal(false);
            fetchRoutes();
            setNewRoute({
                name: '',
                startPoint: { name: '', coordinates: { lat: 0, lng: 0 } },
                endPoint: { name: '', coordinates: { lat: 0, lng: 0 } },
                distanceKm: 0,
                estimatedDurationMins: 0
            });
        } catch (err) {
            alert(err.response?.data?.msg || 'Error adding route');
        }
    };

    const onChange = e => setNewRoute({ ...newRoute, [e.target.name]: e.target.value });

    // Simplified nested change handlers for demo simplicity
    const onStartChange = e => setNewRoute({
        ...newRoute,
        startPoint: { ...newRoute.startPoint, name: e.target.value }
    });
    const onEndChange = e => setNewRoute({
        ...newRoute,
        endPoint: { ...newRoute.endPoint, name: e.target.value }
    });

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Route Management</h1>
                    <p className="text-gray-400">Configure shuttle routes and schedules</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Route
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map Placeholder */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 h-[400px] lg:h-auto overflow-hidden relative group">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 group-hover:bg-gray-900/40 transition-colors">
                        <div className="text-center">
                            <Map className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 font-semibold">Interactive Map View</p>
                            <p className="text-xs text-gray-600">(Google Maps / Leaflet Integration)</p>
                        </div>
                    </div>
                </div>

                {/* Route List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Active Routes</h3>
                    {loading ? <p>Loading...</p> : routes.map(route => (
                        <motion.div
                            key={route._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-bold flex items-center gap-2">
                                        <Navigation className="w-5 h-5 text-blue-400" />
                                        {route.name}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> {route.startPoint.name}
                                        </span>
                                        <span>→</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> {route.endPoint.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-white">{route.estimatedDurationMins} <span className="text-sm text-gray-500 font-normal">min</span></span>
                                    <span className="text-sm text-gray-400">{route.distanceKm} km</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-4 flex gap-3">
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" /> View Schedule
                                </button>
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" /> Edit Stops
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {routes.length === 0 && !loading && <p className="text-gray-500 text-center">No active routes found.</p>}
                </div>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg border border-gray-700"
                    >
                        <h2 className="text-2xl font-bold mb-6">Create New Route</h2>
                        <form onSubmit={handleAddRoute} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1">Route Name</label>
                                <input name="name" value={newRoute.name} onChange={onChange} placeholder="e.g. Airport -> City Center" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Start Location</label>
                                    <input value={newRoute.startPoint.name} onChange={onStartChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">End Location</label>
                                    <input value={newRoute.endPoint.name} onChange={onEndChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Distance (km)</label>
                                    <input type="number" name="distanceKm" value={newRoute.distanceKm} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Duration (min)</label>
                                    <input type="number" name="estimatedDurationMins" value={newRoute.estimatedDurationMins} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">Create Route</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default RouteManager;
