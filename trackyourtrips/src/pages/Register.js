import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Users, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const authContext = useContext(AuthContext);
    const { register, isAuthenticated } = authContext;
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'passenger' // Default
    });

    const { name, email, password, role } = user;

    const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (name === '' || email === '' || password === '') {
            alert('Please enter all fields');
        } else {
            const result = await register({ name, email, password, role });
            if (!result.success) {
                alert(result.msg);
            }
        }
    };

    const formVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            initial="hidden"
            animate="visible"
            variants={formVariants}
        >
            <motion.div
                className="w-full max-w-md bg-darksurface/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 border border-gray-700/50"
                variants={itemVariants}
                transition={{ delay: 0.1 }}
            >
                {/* Header */}
                <motion.div className="text-center mb-8" variants={itemVariants} transition={{ delay: 0.2 }}>
                    <motion.div
                        className="flex justify-center mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                    >
                        <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                    </motion.div>
                    <h2 className="text-4xl font-bold text-darktext mb-2">Join TrackYourTrips</h2>
                    <p className="text-gray-400">Create your account to get started</p>
                </motion.div>

                {/* Form */}
                <motion.form onSubmit={onSubmit} className="space-y-6" variants={itemVariants} transition={{ delay: 0.4 }}>
                    {/* Name Field */}
                    <motion.div variants={itemVariants} transition={{ delay: 0.5 }}>
                        <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center">
                            <User className="w-4 h-4 inline mr-2 text-primary-400" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-darkcard focus:bg-darkcard focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 text-darktext placeholder-gray-500"
                            placeholder="John Doe"
                            required
                        />
                    </motion.div>

                    {/* Email Field */}
                    <motion.div variants={itemVariants} transition={{ delay: 0.6 }}>
                        <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center">
                            <Mail className="w-4 h-4 inline mr-2 text-primary-400" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-darkcard focus:bg-darkcard focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 text-darktext placeholder-gray-500"
                            placeholder="you@example.com"
                            required
                        />
                    </motion.div>

                    {/* Password Field */}
                    <motion.div variants={itemVariants} transition={{ delay: 0.7 }}>
                        <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center">
                            <Lock className="w-4 h-4 inline mr-2 text-primary-400" />
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-darkcard focus:bg-darkcard focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 text-darktext placeholder-gray-500"
                            placeholder="••••••••"
                            required
                        />
                    </motion.div>

                    {/* Role Select */}
                    <motion.div variants={itemVariants} transition={{ delay: 0.8 }}>
                        <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center">
                            <Users className="w-4 h-4 inline mr-2 text-primary-400" />
                            I am a...
                        </label>
                        <div className="relative">
                            <select
                                name="role"
                                value={role}
                                onChange={onChange}
                                className="appearance-none w-full px-4 py-3 rounded-xl border border-gray-700 bg-darkcard focus:bg-darkcard focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 text-darktext cursor-pointer"
                            >
                                <option value="passenger">Passenger</option>
                                <option value="driver">Driver</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-primary-500/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                        transition={{ delay: 0.9 }}
                    >
                        <UserPlus className="w-5 h-5" />
                        Create Account
                    </motion.button>
                </motion.form>

                {/* Login Link */}
                <motion.p className="text-center text-gray-400 text-sm mt-8" variants={itemVariants} transition={{ delay: 1.0 }}>
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-500 font-semibold hover:text-secondary-500 transition-colors">
                        Sign In
                    </Link>
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default Register;

