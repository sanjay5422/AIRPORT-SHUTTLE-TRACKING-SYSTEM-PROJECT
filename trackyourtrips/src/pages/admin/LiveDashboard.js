import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { Map, Navigation, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';

const LiveDashboard = () => {
    const [socket, setSocket] = useState(null);
    const [locations, setLocations] = useState({}); // { shuttleId: { lat, lng } }
    const [shuttles, setShuttles] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Mock map setup (since we don't have a real map provider key here, we'll simulate a visual grid)
    const mapRef = useRef(null);

    useEffect(() => {
        // Initialize Socket
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            setIsConnected(true);
            newSocket.emit('join-dashboard');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('fleet-update', (data) => {
            console.log('Fleet Update:', data);
            setLocations(prev => ({
                ...prev,
                [data.shuttleId]: data.location
            }));
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        // Fetch initial shuttle list
        const fetchShuttles = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/fleet/shuttles');
                setShuttles(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchShuttles();
    }, []);

    // Simulation of driver movement for demo purposes (In real app this comes from driver app)
    const simulateMovement = () => {
        if (!socket) return;
        // Select a random shuttle to move
        if (shuttles.length > 0) {
            const randomShuttle = shuttles[Math.floor(Math.random() * shuttles.length)];
            const mockLocation = {
                lat: 28.55 + (Math.random() * 0.01),
                lng: 77.10 + (Math.random() * 0.01),
                heading: Math.floor(Math.random() * 360),
                speed: Math.floor(Math.random() * 60)
            };
            socket.emit('driver-location', {
                shuttleId: randomShuttle._id,
                driverId: randomShuttle.driverId?._id,
                location: mockLocation
            });
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Map className="w-8 h-8 text-blue-500" />
                        Live Fleet Monitoring
                    </h1>
                    <p className="text-gray-400">Real-time tracking of all active shuttles</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={simulateMovement} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-xs">
                        Simulate Ping
                    </button>
                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${isConnected ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
                        {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        {isConnected ? 'System Online' : 'Disconnected'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Map Area */}
                <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/50 flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-[80%] h-[80%] border-2 border-dashed border-gray-700 rounded-xl relative">
                            {/* Render "Dots" for shuttles */}
                            {Object.entries(locations).map(([id, loc]) => (
                                <motion.div
                                    key={id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, x: (loc.lng - 77.10) * 5000, y: (loc.lat - 28.55) * 5000 }} // Fake projection for demo
                                    className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 flex items-center justify-center top-1/2 left-1/2"
                                >
                                    <div className="w-full h-full rounded-full animate-ping bg-blue-400 absolute opacity-75"></div>
                                </motion.div>
                            ))}
                        </div>
                        <p className="mt-4 text-gray-500">Map Visualization Area (Mock Projection)</p>
                    </div>
                </div>

                {/* Sidebar List */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="font-bold text-lg">Active Shuttles ({shuttles.length})</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {shuttles.map(shuttle => {
                            const lastLoc = locations[shuttle._id];
                            return (
                                <div key={shuttle._id} className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-white">
                                            {shuttle.vehicleId?.vehicleNumber || 'Unknown Vehicle'}
                                        </span>
                                        {lastLoc ? (
                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> Live
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500">Offline</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-1">{shuttle.routeId?.name || 'No Route Assigned'}</p>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>Speed: {lastLoc?.speed || 0} km/h</span>
                                        <span>Driver: {shuttle.driverId?.name || 'Unassigned'}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveDashboard;
