import React, { useState } from 'react';
import { Truck, Play, Square, MapPin, Clock, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const DriverDashboard = ({ activeTrip, startTrip, stopTrip }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
        hover: { scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    };
    return (
        <motion.div className="space-y-8 p-4" initial="hidden" animate="visible" variants={itemVariants}>
            {/* Header */}
            <motion.div
                className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-8 flex items-center justify-between relative overflow-hidden border border-gray-700/50"
                variants={cardVariants}
                whileHover="hover"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-all duration-500"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-darktext mb-2 tracking-tight">Driver Dashboard</h1>
                    <p className="text-lg text-gray-400 max-w-xl">Manage your active route and broadcast real-time location to passengers.</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform duration-500">
                    <Truck className="w-10 h-10 text-white" />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Control Card */}
                <motion.div className="lg:col-span-2" variants={itemVariants} transition={{ delay: 0.1 }}>
                    <motion.div
                        className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-10 h-full flex flex-col justify-center items-center text-center relative overflow-hidden border border-gray-700/50"
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-darkcard/50 to-darksurface/50 -z-10"></div>

                        <div className="w-20 h-20 bg-primary-950 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Navigation className="w-10 h-10 text-primary-400" />
                        </div>

                        <h2 className="text-3xl font-bold text-darktext mb-4">
                            {activeTrip ? 'Route in Progress' : 'Ready to Start?'}
                        </h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg">
                            {activeTrip
                                ? `You are currently broadcasting location for Trip ID: ${activeTrip.shuttle || activeTrip._id}`
                                : 'Start a new trip to begin broadcasting your live location to waiting passengers.'}
                        </p>

                        {!activeTrip ? (
                            <motion.button
                                onClick={startTrip}
                                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-10 text-xl rounded-2xl font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-95 transition-all duration-300 overflow-hidden"
                                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.3), 0 4px 6px -2px rgba(34, 197, 94, 0.1)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <Play className="w-6 h-6 fill-current" /> Start Route
                                </span>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </motion.button>
                        ) : (
                            <div className="space-y-6 w-full max-w-md">
                                <motion.div
                                    className="flex items-center justify-center gap-3 p-4 bg-green-900/50 border border-green-700 rounded-xl text-green-400 font-semibold shadow-inner"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-3 h-3 bg-green-500 rounded-full"
                                    ></motion.div>
                                    Live Route Active
                                </motion.div>
                                <motion.button
                                    onClick={stopTrip}
                                    className="w-full inline-flex items-center justify-center gap-3 bg-darkcard border-2 border-red-900/50 text-red-500 py-4 px-10 text-lg rounded-2xl font-bold hover:bg-red-900/20 hover:border-red-700 shadow-lg active:scale-95 transition-all duration-300"
                                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Square className="w-5 h-5 fill-current" /> End Current Route
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Info Sidebar */}
                <div className="space-y-8">
                    {/* Trip Info */}
                    {activeTrip && (
                        <motion.div
                            className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-8 border border-gray-700/50 border-l-4 border-l-green-500"
                            variants={cardVariants}
                            whileHover="hover"
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-xl font-bold text-darktext mb-6 flex items-center gap-3">
                                <span className="p-2 bg-green-900/50 rounded-lg shadow-inner"><MapPin className="w-5 h-5 text-green-400" /></span>
                                Current Trip Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-darkcard rounded-xl border border-gray-800">
                                    <span className="text-gray-400 font-medium">Trip ID</span>
                                    <code className="bg-gray-800 px-3 py-1 rounded-lg border border-gray-700 text-sm font-mono text-primary-400 font-bold">
                                        {activeTrip._id.slice(0, 8)}...
                                    </code>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-darkcard rounded-xl border border-gray-800">
                                    <span className="text-gray-400 font-medium">Status</span>
                                    <span className="text-green-400 font-bold">Broadcasting</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Quick Guide */}
                    <motion.div
                        className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-8 border border-gray-700/50"
                        variants={cardVariants}
                        whileHover="hover"
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className="text-xl font-bold text-darktext mb-6 flex items-center gap-3">
                            <span className="p-2 bg-blue-900/50 rounded-lg shadow-inner"><Clock className="w-5 h-5 text-blue-400" /></span>
                            Quick Guide
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Click 'Start Route' to begin broadcasting.",
                                "Your location updates automatically.",
                                "Passengers can track you in real-time.",
                                "Click 'End Route' when you arrive."
                            ].map((step, i) => (
                                <motion.li
                                    key={i}
                                    className="flex gap-4 items-start"
                                    variants={itemVariants}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                >
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-950 text-primary-400 font-bold text-xs flex items-center justify-center mt-0.5 shadow-inner">
                                        {i + 1}
                                    </span>
                                    <span className="text-gray-400 text-sm font-medium">{step}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default DriverDashboard;