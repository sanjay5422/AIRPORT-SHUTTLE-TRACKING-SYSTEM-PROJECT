import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Map, Menu, X, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const onLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navItemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        hover: { scale: 1.05, color: '#6366f1' },
        tap: { scale: 0.95 },
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeIn' } },
    };

    const guestLinks = (
        <>
            <motion.div
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
            >
                <Link
                    to="/login"
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive('/login')
                        ? 'text-primary-600 bg-primary-50 shadow-sm'
                        : 'text-darktext hover:text-primary-600 hover:bg-darksurface/50'
                        }`}
                >
                    Login
                </Link>
            </motion.div>
            <motion.div
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
            >
                <Link
                    to="/register"
                    className="ml-2 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-size-200 hover:bg-pos-100 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 active:scale-95"
                >
                    Sign Up
                </Link>
            </motion.div>
        </>
    );

    const authLinks = (
        <div className="flex items-center gap-3">
            <motion.div
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                className="hidden md:flex items-center gap-3 px-4 py-2 bg-darksurface rounded-full border border-gray-700/50 shadow-sm"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-bold text-xs">
                    {user && user.name.charAt(0)}
                </div>
                <span className="text-darktext text-sm font-medium">
                    {user && user.name.split(' ')[0]}
                </span>
            </motion.div>

            <motion.button
                onClick={onLogout}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-900/20 group"
            >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline">Logout</span>
            </motion.button>
        </div>
    );

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-darksurface/80 backdrop-blur-xl shadow-lg border-b border-gray-700/50 py-2'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex-shrink-0 flex items-center gap-3 group"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                            <div className="relative p-2.5 bg-gradient-to-br from-primary-600 to-secondary-700 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                                <Map className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-white' : 'text-gray-200'}`}>
                            Track<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">YourTrips</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {isAuthenticated ? authLinks : guestLinks}
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-400 hover:bg-darksurface/50 rounded-xl transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </motion.button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="md:hidden mt-4 p-4 bg-darksurface/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-lg"
                        >
                            <div className="space-y-2">
                                {isAuthenticated ? (
                                    <>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-darkcard rounded-xl mb-4">
                                            <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold">
                                                {user && user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-darktext">{user && user.name}</p>
                                                <p className="text-xs text-gray-400 capitalize">{user && user.role}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={onLogout}
                                            className="w-full flex items-center justify-center text-red-500 px-4 py-3 text-sm font-semibold hover:bg-red-900/20 rounded-xl transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" /> Logout
                                        </motion.button>
                                    </>
                                ) : (
                                    <div className="grid gap-3">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Link
                                                to="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block text-center text-darktext bg-darksurface/50 px-4 py-3 text-sm font-semibold hover:bg-darksurface rounded-xl border border-gray-700/50"
                                            >
                                                Login
                                            </Link>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Link
                                                to="/register"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block text-center bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-3 text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/20"
                                            >
                                                Create Account
                                            </Link>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

export default Navbar;
