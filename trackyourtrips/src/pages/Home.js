import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, ChevronRight, Shield, Clock, Smartphone } from 'lucide-react';

const Home = () => {
    return (
        <motion.div
            className="min-h-screen bg-darkbg text-darktext flex flex-col relative overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >

            {/* Hero Section */}
            <div className="relative min-h-screen flex items-center justify-center pt-20">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-br from-darkbg via-primary-950 to-secondary-950 -z-20"></div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-primary-900/20 to-secondary-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-blue-900/20 to-teal-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10"
                />

                <div className="container mx-auto px-6 z-10 text-center">
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-full bg-darkcard border border-gray-700 shadow-inner"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                        <span className="text-sm font-semibold text-primary-400 tracking-wide">Next Gen Shuttle Tracking</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        transition={{ delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-darktext drop-shadow-sm"
                    >
                        Travel with <br />
                        <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-size-200 animate-bg-pan bg-clip-text text-transparent">Confidence</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Premium real-time airport shuttle tracking.
                        Experience seamless navigation and never miss your ride again.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link to="/login" className="group relative bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all flex items-center gap-3 overflow-hidden">
                            <span className="z-10">Get Started Now</span>
                            <ChevronRight className="w-5 h-5 z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>

                        <Link to="/register" className="bg-darksurface/50 backdrop-blur-md rounded-2xl px-8 py-4 text-gray-300 font-bold text-lg hover:text-primary-400 border border-gray-700/50 shadow-glass">
                            Create Account
                        </Link>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        variants={itemVariants}
                        transition={{ delay: 0.8 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto"
                    >
                        {[
                            { icon: Map, title: "Real-Time Tracking", desc: "Live GPS updates with zero latency." },
                            { icon: Shield, title: "Secure Journey", desc: "Verified drivers and encrypted data." },
                            { icon: Clock, title: "Precise Timing", desc: "AI-powered arrival estimations." },
                        ].map((feature, i) => (
                            <motion.div key={i} className="bg-darksurface/80 backdrop-blur-xl rounded-2xl p-8 text-center border border-gray-700/50 shadow-glass-lg hover:scale-105 duration-300"
                                variants={cardVariants}
                                whileHover="hover"
                            >
                                <div className="w-14 h-14 mx-auto bg-primary-950 rounded-2xl flex items-center justify-center mb-6 text-primary-400 shadow-inner">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-darktext mb-3">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <motion.div
                className="py-8 text-center text-gray-500 text-sm border-t border-gray-800 bg-darksurface/50 mt-12"
                variants={itemVariants}
                transition={{ delay: 1.0 }}
            >
                &copy; 2026 TrackYourTrips Inc. All rights reserved.
            </motion.div>
        </motion.div>
    );
};

export default Home;
