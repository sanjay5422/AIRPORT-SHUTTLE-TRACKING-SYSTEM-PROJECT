import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingConfiguration = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/pricing');
            setRules(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleEdit = (rule) => {
        setEditingId(rule._id);
        setEditForm(rule);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/pricing', editForm, {
                headers: { 'x-auth-token': token }
            });
            setEditingId(null);
            fetchPricing();
            alert('Pricing updated successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to update pricing');
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <h1 className="text-3xl font-bold mb-2">Pricing Configuration</h1>
            <p className="text-gray-400 mb-8">Manage base fares and rates for different vehicle types</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Rule Card (Mock for now, focusing on editing existing types or seeding) */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col justify-center items-center opacity-50 cursor-not-allowed">
                    <span className="text-4xl text-gray-600">+</span>
                    <span className="text-gray-500 mt-2">Add Vehicle Type</span>
                    <span className="text-xs text-gray-600">(Coming Soon)</span>
                </div>

                {rules.map(rule => (
                    <motion.div
                        key={rule._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white capitalize">{rule.vehicleType}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs ${rule.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Base Fare ($)</label>
                                {editingId === rule._id ? (
                                    <input
                                        type="number"
                                        value={editForm.baseFare}
                                        onChange={e => setEditForm({ ...editForm, baseFare: Number(e.target.value) })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    />
                                ) : (
                                    <div className="text-2xl font-mono">${rule.baseFare}</div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Per Km ($)</label>
                                    {editingId === rule._id ? (
                                        <input
                                            type="number" step="0.1"
                                            value={editForm.pricePerKm}
                                            onChange={e => setEditForm({ ...editForm, pricePerKm: Number(e.target.value) })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                        />
                                    ) : (
                                        <div className="font-mono">${rule.pricePerKm}/km</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Per Min ($)</label>
                                    {editingId === rule._id ? (
                                        <input
                                            type="number" step="0.1"
                                            value={editForm.pricePerMinute}
                                            onChange={e => setEditForm({ ...editForm, pricePerMinute: Number(e.target.value) })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                        />
                                    ) : (
                                        <div className="font-mono">${rule.pricePerMinute}/min</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Peak Multiplier (x)</label>
                                {editingId === rule._id ? (
                                    <input
                                        type="number" step="0.1"
                                        value={editForm.peakMultiplier}
                                        onChange={e => setEditForm({ ...editForm, peakMultiplier: Number(e.target.value) })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                                    />
                                ) : (
                                    <div className="font-mono text-yellow-400">x{rule.peakMultiplier}</div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                            {editingId === rule._id ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleEdit(rule)}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
                                >
                                    Edit Rules
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {rules.length === 0 && !loading && (
                <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Pricing Rules Found</h3>
                    <p className="text-gray-400">Please seed the database with initial pricing rules.</p>
                </div>
            )}
        </div>
    );
};

export default PricingConfiguration;
