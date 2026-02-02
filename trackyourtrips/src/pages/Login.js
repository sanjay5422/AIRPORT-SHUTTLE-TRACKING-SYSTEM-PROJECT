import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const authContext = useContext(AuthContext);
    const { login, isAuthenticated } = authContext;
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const [user, setUser] = useState({
        email: '',
        password: ''
    });

    const { email, password } = user;

    const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (email === '' || password === '') {
            alert('Please fill in all fields');
        } else {
            const result = await login({ email, password });
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
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                    </motion.div>
                    <h2 className="text-4xl font-bold text-darktext mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Sign in to track your trips</p>
                </motion.div>

                {/* Form */}
                <motion.form onSubmit={onSubmit} className="space-y-6" variants={itemVariants} transition={{ delay: 0.4 }}>
                    {/* Email Field */}
                    <motion.div variants={itemVariants} transition={{ delay: 0.5 }}>
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
                    <motion.div variants={itemVariants} transition={{ delay: 0.6 }}>
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

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-primary-500/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                        transition={{ delay: 0.7 }}
                    >
                        <LogIn className="w-5 h-5" />
                        Sign In
                    </motion.button>
                </motion.form>

                {/* Sign Up Link */}
                <motion.p className="text-center text-gray-400 text-sm mt-8" variants={itemVariants} transition={{ delay: 0.8 }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-500 font-semibold hover:text-secondary-500 transition-colors">
                        Sign Up
                    </Link>
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default Login;
