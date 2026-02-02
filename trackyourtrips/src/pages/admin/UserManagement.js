import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, MoreVertical, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:5000/api/users';
            if (filterRole !== 'ALL') url += `?role=${filterRole}`;

            const res = await axios.get(url, {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/users/${id}/status`, { status: newStatus }, {
                headers: { 'x-auth-token': token }
            });
            fetchUsers(); // Refresh
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
            <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-gray-400">Manage drivers, passengers, and admins</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="flex gap-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {['ALL', 'PASSENGER', 'DRIVER', 'ADMIN'].map(role => (
                    <button
                        key={role}
                        onClick={() => setFilterRole(role)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterRole === role
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {role === 'ALL' ? 'All Users' : role + 's'}
                    </button>
                ))}
            </motion.div>

            <motion.div
                className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-800/50">
                                <th className="p-4 text-gray-400 font-semibold text-sm">User</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Role</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Status</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Joined</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users found</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <motion.tr
                                        key={user._id}
                                        variants={itemVariants}
                                        className="hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{user.name}</p>
                                                    <p className="text-sm text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                                                    user.role === 'DRIVER' ? 'bg-orange-900/50 text-orange-400 border border-orange-800' :
                                                        'bg-blue-900/50 text-blue-400 border border-blue-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1.5 text-sm font-medium ${user.status === 'APPROVED' ? 'text-emerald-400' :
                                                    user.status === 'BLOCKED' ? 'text-red-400' :
                                                        'text-yellow-400'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${user.status === 'APPROVED' ? 'bg-emerald-400' :
                                                        user.status === 'BLOCKED' ? 'bg-red-400' :
                                                            'bg-yellow-400'
                                                    }`}></span>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.role === 'DRIVER' && (
                                                    <button
                                                        onClick={() => navigate(`/admin/driver-verification/${user._id}`)}
                                                        className="p-2 hover:bg-gray-700 rounded-lg text-blue-400"
                                                        title="Verify Documents"
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {user.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleStatusChange(user._id, 'APPROVED')}
                                                        className="p-2 hover:bg-emerald-900/30 rounded-lg text-emerald-400"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {user.status !== 'BLOCKED' && (
                                                    <button
                                                        onClick={() => handleStatusChange(user._id, 'BLOCKED')}
                                                        className="p-2 hover:bg-red-900/30 rounded-lg text-red-400"
                                                        title="Block"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default UserManagement;
