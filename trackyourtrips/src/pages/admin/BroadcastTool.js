import React, { useState } from 'react';
import axios from 'axios';
import { Send, Users, Shield, Bell } from 'lucide-react';

const BroadcastTool = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('ALL');
    const [type, setType] = useState('INFO');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!title || !message) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/notifications/broadcast',
                { title, message, targetRole, type },
                { headers: { 'x-auth-token': token } }
            );
            alert('Broadcast sent successfully!');
            setTitle('');
            setMessage('');
        } catch (err) {
            console.error(err);
            alert('Failed to send broadcast');
        }
        setLoading(false);
    };

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <h1 className="text-3xl font-bold mb-2">Broadcast System</h1>
            <p className="text-gray-400 mb-8">Send urgent alerts and notifications to users</p>

            <div className="max-w-2xl bg-gray-800 p-8 rounded-2xl border border-gray-700">
                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Target Audience</label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'ALL', label: 'Everyone', icon: Users },
                                { id: 'DRIVER', label: 'Drivers Only', icon: CarIcon },
                                { id: 'PASSENGER', label: 'Passengers', icon: UserIcon }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setTargetRole(opt.id)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${targetRole === opt.id
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                            : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    <opt.icon className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-semibold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Notification Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="INFO">Information (Blue)</option>
                            <option value="WARNING">Warning (Yellow)</option>
                            <option value="CRITICAL">Critical Alert (Red)</option>
                            <option value="SUCCESS">Success (Green)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Service Delay due to Weather"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Message Content</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the detailed message here..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : <><Send className="w-5 h-5" /> Send Broadcast</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Simple Icon Wrappers to avoid undefined errors if lucide imports fail or change
const CarIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M5 17H2" /></svg>
);
const UserIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

export default BroadcastTool;
