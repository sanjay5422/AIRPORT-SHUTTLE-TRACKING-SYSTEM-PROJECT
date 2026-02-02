import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        if (localStorage.token) {
            setAuthToken(localStorage.token);
        }

        try {
            const res = await axios.get('http://localhost:5000/api/auth/user');
            setUser(res.data);
            setIsAuthenticated(true);
        } catch (err) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData, config);
            localStorage.setItem('token', res.data.token);
            await loadUser();
            return { success: true };
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || "Server error or connection failed";
            return { success: false, msg };
        }
    };

    const adminLogin = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('http://localhost:5000/api/auth/admin-login', formData, config);
            localStorage.setItem('token', res.data.accessToken);
            // Note: We might want to store refreshToken too, but for now let's stick to token in localStorage
            if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);

            await loadUser();
            return { success: true };
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || "Server error or connection failed";
            return { success: false, msg };
        }
    };

    const register = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData, config);
            localStorage.setItem('token', res.data.token);
            await loadUser();
            return { success: true };
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || "Server error or connection failed";
            return { success: false, msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, adminLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};
