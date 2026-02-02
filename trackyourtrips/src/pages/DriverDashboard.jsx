import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'react-qr-scanner';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Clock, Truck, Fuel, AlertTriangle, Scan, Wifi, WifiOff, Users, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DriverDashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [stops, setStops] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [locationInterval, setLocationInterval] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const lastLocationRef = useRef(null);

    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        fetchBookings();

        // Get initial location for map centering
        navigator.geolocation.getCurrentPosition(
            (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.log(err),
            { enableHighAccuracy: true }
        );

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (locationInterval) clearInterval(locationInterval);
        };
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/bookings/my-active-trip', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            processManifest(res.data);
        } catch (err) {
            console.error("Error fetching bookings", err);
            // Fallback for demo/testing without active trip
            const mockBookings = [
                { _id: '1', passenger: { name: 'Sanjay' }, pickupLocation: 'Terminal 1', status: 'booked' },
                { _id: '2', passenger: { name: 'Alice' }, pickupLocation: 'Terminal 1', status: 'booked' },
                { _id: '3', passenger: { name: 'Bob' }, pickupLocation: 'Hotel A', status: 'booked' },
            ];
            processManifest(mockBookings);
        }
    };

    const processManifest = (data) => {
        const grouped = data.reduce((acc, booking) => {
            const loc = booking.pickupLocation || 'Unknown';
            if (!acc[loc]) acc[loc] = [];
            acc[loc].push(booking);
            return acc;
        }, {});

        const stopsArray = Object.keys(grouped).map(loc => ({
            location: loc, // In a real app, geocode this to lat/lng
            passengers: grouped[loc],
            expanded: false
        }));
        setStops(stopsArray);
        setBookings(data);
    };

    const handleScan = async (data) => {
        if (data && !scanResult) {
            try {
                let ticketId = data.text;
                try {
                    const parsed = JSON.parse(data.text);
                    if (parsed.ticketId) ticketId = parsed.ticketId;
                    if (parsed.token) ticketId = parsed.token;
                } catch (e) {
                    // text is likely raw ID/token
                }

                const res = await axios.post('http://localhost:5000/api/tickets/validate', { ticketId });

                if (res.status === 200) {
                    setScanResult({ success: true, message: `ACCESS GRANTED: ${res.data.passengerName}` });
                    speak(`Welcome, ${res.data.passengerName}`);

                    if (res.data.bookingId) {
                        updateLocalPassengerStatus(res.data.bookingId);
                    } else {
                        updateLocalPassengerStatus(null, res.data.seatNumber || ticketId);
                    }
                }
            } catch (err) {
                console.error(err);
                setScanResult({ success: false, message: "ACCESS DENIED: RED FLAG" }); // err.response?.data?.message
                playSound('error');
            }
            setTimeout(() => {
                setScanning(false);
                setScanResult(null);
            }, 3000);
        }
    };

    const updateLocalPassengerStatus = (bookingId, fallbackId) => {
        const updatedBookings = bookings.map(b => {
            if (b._id === bookingId) return { ...b, status: 'completed' };
            return b;
        });
        processManifest(updatedBookings);
    };

    const speak = (text) => {
        const ut = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(ut);
    };

    const playSound = (type) => {
        // Implementation for futuristic error sound
    };

    const toggleOnline = () => {
        const newState = !isOnline;
        setIsOnline(newState);

        if (newState) {
            const driverId = user?._id || user?.id;
            const id = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });

                    const now = Date.now();
                    if (lastLocationRef.current) {
                        const { lat, lng, time } = lastLocationRef.current;
                        if (lat === latitude && lng === longitude && (now - time > 15 * 60 * 1000)) {
                            setIsOnline(false);
                            navigator.geolocation.clearWatch(id);
                            toast.info("SYSTEM PAUSE: INACTIVITY DETECTED");
                            return;
                        }
                    }
                    lastLocationRef.current = { lat: latitude, lng: longitude, time: now };
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );

            const interval = setInterval(() => {
                if (lastLocationRef.current) {
                    socketRef.current.emit('driverLocationUpdate', {
                        lat: lastLocationRef.current.lat,
                        lng: lastLocationRef.current.lng,
                        driverId: driverId
                    });
                }
            }, 5000);
            setLocationInterval(interval);
        } else {
            if (locationInterval) clearInterval(locationInterval);
        }
    };

    const reportDelay = (reason) => {
        if (!bookings.length) {
            toast.warn("NO TRIP DATA AVAIL");
            return;
        }
        socketRef.current.emit('tripUpdate', {
            type: 'DELAY',
            reason,
            tripId: bookings[0].trip
        });
        toast.info(`BROADCAST: ${reason}`);
    };

    // Custom Icon for Shuttle
    const shuttleIcon = new L.DivIcon({
        className: 'custom-icon',
        html: `<div style="background-color: #00f3ff; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    return (
        <div className="relative h-screen w-full overflow-hidden bg-cyber-black text-cyber-gray font-sans selection:bg-cyber-pink selection:text-white">

            {/* BACKGROUND: HOLOGRAM MAP */}
            <div className="absolute inset-0 z-0">
                {currentLocation ? (
                    <MapContainer
                        center={[currentLocation.lat, currentLocation.lng]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        className="grayscale invert brightness-75 contrast-125 saturate-200" // CSS filters for dark mode
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={shuttleIcon} />
                        {/* Render Stops roughly around (mock coordinates for demo if real ones missing) */}
                    </MapContainer>
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-900">
                        <span className="font-orbitron animate-pulse text-cyber-cyan">INITIALIZING GPS LINK...</span>
                    </div>
                )}
                {/* Overlay Gradient/Grid */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none"></div>
            </div>

            {/* FOREGROUND: HUD UI */}
            <div className="relative z-10 flex flex-col h-full pointer-events-none p-4 pb-20 md:pb-4">

                {/* TOP BAR */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="bg-black/80 backdrop-blur-md border border-cyber-cyan/30 p-4 rounded-br-2xl clip-path-polygon">
                        <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">
                            SHUTTLE<span className="text-cyber-cyan">OS</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            {isOnline ? <Wifi size={16} className="text-cyber-cyan animate-pulse" /> : <WifiOff size={16} className="text-red-500" />}
                            <span className={`text-sm font-tech tracking-wider ${isOnline ? 'text-cyber-cyan' : 'text-gray-500'}`}>
                                SYSTEM: {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md border-l-4 border-cyber-pink p-3 rounded-l-lg">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-cyber-pink font-bold font-orbitron">CURRENT SPEED</span>
                            <span className="text-3xl font-tech text-white">45 <span className="text-sm text-gray-400">KM/H</span></span>
                        </div>
                    </div>
                </div>

                {/* CENTER / RIGHT PANELS */}
                <div className="flex-1 flex justify-between items-end mt-4 gap-4">

                    {/* LEFT PANEL: PASSENGER MANIFEST */}
                    <div className="w-1/3 max-w-sm pointer-events-auto hidden md:block">
                        <div className="bg-black/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden shadow-glass">
                            <div className="bg-gray-900/90 p-3 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="font-orbitron text-cyber-cyan flex items-center gap-2">
                                    <Users size={16} /> MANIFEST
                                </h3>
                                <span className="font-tech text-xs bg-cyber-cyan/10 text-cyber-cyan px-2 py-0.5 rounded">
                                    {bookings.length} PAX
                                </span>
                            </div>
                            <div className="max-h-[40vh] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                {stops.map((stop, idx) => (
                                    <div key={idx} className="bg-gray-800/50 p-3 rounded border-l-2 border-cyber-cyan">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-white font-rajdhani">{stop.location}</span>
                                            <span className="text-xs font-tech text-gray-400">{stop.passengers.length} DROP</span>
                                        </div>
                                    </div>
                                ))}
                                {stops.length === 0 && <div className="p-4 text-center text-gray-600 font-tech">NO ACTIVE CONTRACTS</div>}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: ACTIONS */}
                    <div className="flex flex-col gap-4 pointer-events-auto items-end w-full md:w-auto">

                        {/* ONLINE TOGGLE */}
                        <button
                            onClick={toggleOnline}
                            className={`group relative overflow-hidden px-8 py-3 font-orbitron font-bold tracking-wider transition-all clip-path-button
                                ${isOnline ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan shadow-neon' : 'bg-gray-900/80 text-gray-500 border border-gray-700 hover:border-gray-500'}
                            `}
                        >
                            <span className="relative z-10">{isOnline ? 'DISENGAGE SYSTEM' : 'ENGAGE SYSTEM'}</span>
                        </button>

                        {/* UTILITY BUTTONS */}
                        <div className="flex gap-2">
                            <button onClick={() => reportDelay('Traffic')} className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-3 rounded hover:bg-yellow-500/20 active:scale-95 transition-all">
                                <Clock size={24} />
                            </button>
                            <button onClick={() => reportDelay('Fuel')} className="bg-orange-500/10 border border-orange-500/50 text-orange-500 p-3 rounded hover:bg-orange-500/20 active:scale-95 transition-all">
                                <Fuel size={24} />
                            </button>
                            <button onClick={() => reportDelay('Breakdown')} className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded hover:bg-red-500/20 active:scale-95 transition-all">
                                <AlertTriangle size={24} />
                            </button>
                        </div>

                        {/* SCAN BUTTON (MAIN PRIMARY) */}
                        <button
                            onClick={() => setScanning(true)}
                            className="bg-cyber-pink hover:bg-pink-600 text-black font-orbitron font-bold py-6 px-10 rounded-xl shadow-neon-pink active:scale-95 transition-transform flex items-center gap-3 w-full md:w-auto justify-center"
                        >
                            <Scan size={32} />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-xs opacity-75">PASSENGER</span>
                                <span className="text-xl">SCAN TICKET</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* SCANNER OVERLAY */}
            {scanning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg p-4">
                        <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-cyber-cyan rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-cyber-cyan rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-cyber-cyan rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-cyber-cyan rounded-br-xl"></div>

                        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden relative shadow-2xl">
                            <div className="p-4 bg-black flex justify-between items-center border-b border-gray-800">
                                <h2 className="text-cyber-cyan font-orbitron tracking-widest flex items-center gap-2">
                                    <Activity className="animate-pulse" size={18} /> SCANNING TARGET
                                </h2>
                                <button onClick={() => setScanning(false)} className="text-gray-500 hover:text-white font-tech">ABORT</button>
                            </div>
                            <div className="h-80 relative bg-black">
                                <QrScanner
                                    delay={300}
                                    onError={(err) => console.error(err)}
                                    onScan={handleScan}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    constraints={{ video: { facingMode: 'environment' } }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-64 h-64 border border-cyber-pink/50 rounded-lg relative">
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyber-pink shadow-[0_0_10px_#ff00ff] animate-scan-line"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-black font-tech text-center text-gray-400 text-xs">
                                ALIGN QR CODE WITHIN RETICLE
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERT OVERLAY (SCAN RESULT) */}
            {scanResult && (
                <div className={`fixed top-0 left-0 right-0 p-6 z-[60] text-center font-orbitron font-bold text-2xl shadow-xl flex items-center justify-center gap-4 transition-transform transform ${scanResult.success ? 'bg-green-500 text-black' : 'bg-red-600 text-white'}`}>
                    {scanResult.success ? <div className="h-4 w-4 bg-black rounded-full animate-ping" /> : <div className="h-4 w-4 bg-white rounded-full animate-pulse" />}
                    {scanResult.message}
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
