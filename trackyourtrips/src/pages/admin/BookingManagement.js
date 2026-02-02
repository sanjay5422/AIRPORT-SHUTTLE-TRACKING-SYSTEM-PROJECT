import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Filter, XCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBookings();
    }, [filterStatus]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:5000/api/bookings';
            if (filterStatus !== 'ALL') url += `?status=${filterStatus}`;

            const res = await axios.get(url, {
                headers: { 'x-auth-token': token }
            });
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleCancel = async (id) => {
        const reason = prompt("Enter cancellation reason (Admin Note):");
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${id}/admin-cancel`, { reason }, {
                headers: { 'x-auth-token': token }
            });
            fetchBookings();
        } catch (err) {
            console.error(err);
            alert('Cancellation failed');
        }
    };

    const filteredBookings = bookings.filter(b =>
        b.passenger?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b._id.includes(searchTerm)
    );

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Booking Management</h1>
                    <p className="text-gray-400">View and manage passenger reservations</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search name or ID..."
                            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                {['ALL', 'booked', 'cancelled', 'completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${filterStatus === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {status === 'ALL' ? 'All Bookings' : status}
                    </button>
                ))}
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm">
                            <th className="p-4">Passenger</th>
                            <th className="p-4">Route</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading bookings...</td></tr>
                        ) : filteredBookings.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No bookings found</td></tr>
                        ) : (
                            filteredBookings.map(booking => (
                                <motion.tr
                                    key={booking._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-700/30 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="font-semibold text-white">{booking.passenger?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400">{booking.passenger?.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {booking.trip?.route?.name || 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${booking.status === 'booked' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' :
                                                booking.status === 'cancelled' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                                                    'bg-gray-700 text-gray-400'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-white">${booking.amount}</td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(booking.bookingDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {booking.status === 'booked' && (
                                            <button
                                                onClick={() => handleCancel(booking._id)}
                                                className="text-red-400 hover:bg-red-900/30 p-2 rounded-lg transition-colors flex items-center gap-1 ml-auto text-sm"
                                            >
                                                <XCircle className="w-4 h-4" /> Cancel
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingManagement;
