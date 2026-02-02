import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Truck, Plus, Tool, Trash2, Settings, Zap, Droplet, Battery } from 'lucide-react';

const FleetManagement = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        vehicleNumber: '',
        make: '',
        model: '',
        capacity: 10,
        fuelType: 'PETROL',
        isAC: true
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/fleet/vehicles', {
                headers: { 'x-auth-token': token }
            });
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/fleet/vehicles', newVehicle, {
                headers: { 'x-auth-token': token }
            });
            setShowAddModal(false);
            fetchVehicles();
            setNewVehicle({ vehicleNumber: '', make: '', model: '', capacity: 10, fuelType: 'PETROL', isAC: true });
        } catch (err) {
            alert(err.response?.data?.msg || 'Error adding vehicle');
        }
    };

    const onChange = e => setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value });

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Fleet Management</h1>
                    <p className="text-gray-400">Manage vehicles and maintenance</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Vehicle
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <p className="text-gray-400 text-sm font-semibold uppercase">Total Fleet</p>
                    <p className="text-3xl font-bold mt-2">{vehicles.length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <p className="text-gray-400 text-sm font-semibold uppercase">Active</p>
                    <p className="text-3xl font-bold mt-2 text-emerald-400">{vehicles.filter(v => v.status === 'ACTIVE').length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <p className="text-gray-400 text-sm font-semibold uppercase">In Maintenance</p>
                    <p className="text-3xl font-bold mt-2 text-yellow-400">{vehicles.filter(v => v.status === 'UNDER_MAINTENANCE').length}</p>
                </div>
            </div>

            {/* Vehicle Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                    <motion.div
                        key={vehicle._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{vehicle.make} {vehicle.model}</h3>
                                    <p className="text-gray-400 font-mono text-sm">{vehicle.vehicleNumber}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${vehicle.status === 'ACTIVE' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                                        'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                                    }`}>
                                    {vehicle.status}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        {vehicle.fuelType === 'ELECTRIC' ? <Zap className="w-4 h-4" /> : <Droplet className="w-4 h-4" />}
                                        Fuel
                                    </span>
                                    <span className="font-semibold">{vehicle.fuelType}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Capacity</span>
                                    <span className="font-semibold">{vehicle.capacity} Seats</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Registered: {new Date(vehicle.registrationDate).toLocaleDateString()}</span>
                            <button className="text-gray-400 hover:text-white transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Vehicle Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-6">Add New Vehicle</h2>
                        <form onSubmit={handleAddVehicle} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1">Vehicle Number</label>
                                <input name="vehicleNumber" value={newVehicle.vehicleNumber} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Make</label>
                                    <input name="make" value={newVehicle.make} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Model</label>
                                    <input name="model" value={newVehicle.model} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Capacity</label>
                                    <input type="number" name="capacity" value={newVehicle.capacity} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Fuel Type</label>
                                    <select name="fuelType" value={newVehicle.fuelType} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        <option value="PETROL">Petrol</option>
                                        <option value="DIESEL">Diesel</option>
                                        <option value="CNG">CNG</option>
                                        <option value="ELECTRIC">Electric</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">Add Vehicle</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default FleetManagement;
