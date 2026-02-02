import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bell, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { 'x-auth-token': token }
            });
            setNotifications(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Update UI locally
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'CRITICAL': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <h1 className="text-3xl font-bold mb-2">Notification Center</h1>
            <p className="text-gray-400 mb-8">Your alerts and system messages</p>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-3xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Recent Notifications</span>
                    <button onClick={fetchNotifications} className="text-sm text-blue-400 hover:text-blue-300">Refresh</button>
                </div>

                <div className="divide-y divide-gray-700">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <Bell className="w-12 h-12 mb-4 opacity-20" />
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`p-4 flex gap-4 transition-colors ${notification.isRead ? 'bg-transparent' : 'bg-gray-700/30'}`}
                            >
                                <div className="mt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-semibold ${notification.isRead ? 'text-gray-400' : 'text-white'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{notification.message}</p>

                                    {!notification.isRead && notification.recipient && (
                                        <button
                                            onClick={() => markAsRead(notification._id)}
                                            className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
