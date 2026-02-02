import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const authContext = useContext(AuthContext);
    const { adminLogin, isAuthenticated, user } = authContext;
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            navigate('/admin/dashboard');
        } else if (isAuthenticated && user?.role !== 'ADMIN') {
            // If logged in but not admin, maybe redirect to home or show error?
            // For now, let's just leave them here or redirect to home
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (email === '' || password === '') {
            alert('Please fill in all fields');
        } else {
            const result = await adminLogin({ email, password });
            if (!result.success) {
                alert(result.msg);
            }
        }
    };

    const formVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <motion.div
                className="w-full max-w-md bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700"
                initial="hidden"
                animate="visible"
                variants={formVariants}
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-600 rounded-full shadow-lg shadow-red-500/20">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
                    <p className="text-gray-400">Secure Access Only</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 text-sm font-semibold mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                placeholder="admin@airport.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-semibold mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/30 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        Access Dashboard
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
