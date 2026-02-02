import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import QRCode from 'react-qr-code';
import { Navigation, Clock, AlertCircle, Search, Plane, Ticket, CreditCard, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Constants ---
const INDIAN_AIRPORTS = [
    { name: "Indira Gandhi International Airport (DEL)", lat: 28.5562, lng: 77.1000, city: "Delhi" },
    { name: "Chhatrapati Shivaji Maharaj International Airport (BOM)", lat: 19.0896, lng: 72.8656, city: "Mumbai" },
    { name: "Chennai International Airport (MAA)", lat: 12.9941, lng: 80.1709, city: "Chennai" },
    { name: "Kempegowda International Airport (BLR)", lat: 13.1986, lng: 77.7066, city: "Bangalore" },
    { name: "Netaji Subhash Chandra Bose International Airport (CCU)", lat: 22.6547, lng: 88.4467, city: "Kolkata" },
    { name: "Rajiv Gandhi International Airport (HYD)", lat: 17.2403, lng: 78.4294, city: "Hyderabad" },
    { name: "Cochin International Airport (COK)", lat: 10.1518, lng: 76.3930, city: "Kochi" },
    { name: "Sardar Vallabhbhai Patel International Airport (AMD)", lat: 23.0734, lng: 72.6266, city: "Ahmedabad" },
    { name: "Goa International Airport (GOI)", lat: 15.3803, lng: 73.8314, city: "Goa" },
    { name: "Pune Airport (PNQ)", lat: 18.5823, lng: 73.9197, city: "Pune" },
    { name: "Trivandrum International Airport (TRV)", lat: 8.4821, lng: 76.9182, city: "Thiruvananthapuram" },
    { name: "Jaipur International Airport (JAI)", lat: 26.8289, lng: 75.8056, city: "Jaipur" },
    { name: "Coimbatore International Airport (CJB)", lat: 11.0300, lng: 77.0434, city: "Coimbatore" },
    { name: "Tiruchirappalli International Airport (TRZ)", lat: 10.7654, lng: 78.7117, city: "Trichy" }
];

const airportIcon = L.divIcon({
    html: '<div style="font-size: 30px;">✈️</div>',
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const shuttleIcon = L.divIcon({
    html: '<div style="font-size: 30px;">🚌</div>',
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// --- Dummy Data ---
const DUMMY_SEATS = [
    { id: '1A', status: 'booked' }, { id: '1B', status: 'available' }, { id: 'aisle1', type: 'aisle' }, { id: '1C', status: 'booked' }, { id: '1D', status: 'booked' },
    { id: '2A', status: 'available' }, { id: '2B', status: 'available' }, { id: 'aisle2', type: 'aisle' }, { id: '2C', status: 'reserved' }, { id: '2D', status: 'booked' },
    { id: '3A', status: 'available' }, { id: '3B', status: 'booked' }, { id: 'aisle3', type: 'aisle' }, { id: '3C', status: 'available' }, { id: '3D', status: 'available' },
    { id: '4A', status: 'reserved' }, { id: '4B', status: 'reserved' }, { id: 'aisle4', type: 'aisle' }, { id: '4C', status: 'available' }, { id: '4D', status: 'available' },
];

const PassengerDashboard = ({ socket, user, joinTrip }) => {
    // State
    const [shuttleLocation, setShuttleLocation] = useState(null);
    const [tripId, setTripId] = useState('');
    const [trackingActive, setTrackingActive] = useState(false);
    const [eta, setEta] = useState('N/A');
    const [isFlipped, setIsFlipped] = useState(false);
    const [flightNum, setFlightNum] = useState('');
    const [flightInfo, setFlightInfo] = useState(null);

    // User Location (Mocking user at Chennai Airport for demo)
    const userLocation = { lat: 12.9941, lng: 80.1709 };

    // 1. & 5. Socket & Logic
    useEffect(() => {
        if (!socket) return;

        socket.on('location-update', ({ location }) => {
            setShuttleLocation(location);

            // Calculate ETA (Simple Mock Logic)
            const dist = Math.sqrt(
                Math.pow(location.lat - userLocation.lat, 2) +
                Math.pow(location.lng - userLocation.lng, 2)
            );
            // Approx: 1 degree ~ 111km. Speed ~ 50km/h. 
            // Mock: dist * 1000 mins + random variance
            const estimatedMins = Math.round(dist * 100 * 2);
            setEta(`${estimatedMins} mins`);

            // Proximity Alert Geofencing (< 2km approx 0.02 degrees)
            if (dist < 0.02) {
                alert("🔔 Proximity Alert: Shuttle is arriving in 5 mins!");
            }
        });

        return () => socket.off('location-update');
    }, [socket]);

    const handleJoinTrip = () => {
        if (!tripId) {
            alert("Please enter a Trip ID");
            return;
        }
        joinTrip(tripId);
        setTrackingActive(true);
    };

    // 3. Flight Sync Logic
    const checkFlightTime = () => {
        if (!flightNum) return;
        // Mock API response
        const randomHour = Math.floor(Math.random() * 24);
        const randomMin = Math.floor(Math.random() * 60);
        const timeStr = `${randomHour.toString().padStart(2, '0')}:${randomMin.toString().padStart(2, '0')}`;

        // Shuttle 45 mins later
        const landingDate = new Date();
        landingDate.setHours(randomHour, randomMin + 45);
        const shuttleTime = `${landingDate.getHours().toString().padStart(2, '0')}:${landingDate.getMinutes().toString().padStart(2, '0')}`;

        setFlightInfo({
            landing: timeStr,
            shuttle: shuttleTime
        });
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
        hover: { scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    };

    return (
        <motion.div
            className="space-y-8 p-4 min-h-screen"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
        >
            {/* Header */}
            <motion.div
                className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-8 flex items-center justify-between relative overflow-hidden border border-gray-700/50"
                variants={cardVariants}
                whileHover="hover"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-darktext mb-2 tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
                    <p className="text-lg text-gray-400">Manage your journey with real-time updates.</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-lg shadow-primary-500/20">
                    <Navigation className="w-10 h-10 text-white" />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN */}
                <div className="space-y-8">

                    {/* 2. Flip-Card Digital Ticket */}
                    <div className="relative h-64 w-full perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                        <motion.div
                            className={`relative w-full h-full duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Front */}
                            <div className="absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-6 backface-hidden flex flex-col justify-between text-white border border-white/10">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-2xl font-bold">Boarding Pass</h3>
                                        <Plane className="w-8 h-8 opacity-80" />
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-indigo-200 uppercase text-xs font-semibold tracking-wider">Passenger</p>
                                        <p className="font-medium text-lg">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-indigo-200 uppercase text-xs font-semibold tracking-wider">Trip ID</p>
                                        <p className="font-mono text-xl">{tripId || '---'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-200">
                                        <RotateCw className="w-4 h-4" />
                                        <span className="text-xs">Flip for QR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Back */}
                            <div className="absolute w-full h-full bg-white rounded-2xl shadow-xl p-6 backface-hidden rotate-y-180 flex flex-col items-center justify-center border border-gray-200">
                                <h3 className="text-gray-800 font-bold mb-4">Scan to Board</h3>
                                <div className="p-2 bg-white rounded-lg shadow-inner border border-gray-100">
                                    <QRCode value={tripId || "NO_TRIP"} size={128} />
                                </div>
                                <p className="text-xs text-gray-500 mt-4 text-center">Show this to the driver</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* 3. Flight Sync */}
                    <motion.div
                        className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-6 border border-gray-700/50"
                        variants={cardVariants}
                    >
                        <h3 className="text-xl font-bold text-darktext mb-4 flex items-center gap-2">
                            <Plane className="w-5 h-5 text-primary-400" /> Flight Sync
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Flight No. (e.g. 6E 458)"
                                value={flightNum}
                                onChange={(e) => setFlightNum(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-700 bg-darkcard text-darktext focus:ring-2 focus:ring-primary-500/50 outline-none"
                            />
                            <button
                                onClick={checkFlightTime}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-xl text-white font-medium transition-colors"
                            >
                                Check
                            </button>
                        </div>
                        {flightInfo && (
                            <div className="bg-darkcard/50 rounded-xl p-4 border border-gray-700/50 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Est. Landing:</span>
                                    <span className="text-green-400 font-bold">{flightInfo.landing}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Suggested Shuttle:</span>
                                    <span className="text-primary-400 font-bold">{flightInfo.shuttle}</span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                </div>

                {/* CENTER: 1. Live Map */}
                <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants} transition={{ delay: 0.1 }}>
                    <motion.div
                        className="bg-darksurface/80 backdrop-blur-xl rounded-2xl p-2 h-[500px] overflow-hidden border border-gray-700/50 shadow-glass-lg relative"
                        variants={cardVariants}
                    >
                        {/* ETA Overlay */}
                        <div className="absolute top-4 right-4 z-[400] bg-darkcard/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-700 shadow-lg flex flex-col items-end">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">ETA</span>
                            <span className={`text-2xl font-bold ${parseInt(eta) > 30 ? 'text-red-500' : 'text-green-500'}`}>
                                {eta}
                            </span>
                        </div>

                        <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Airports */}
                            {INDIAN_AIRPORTS.map((airport, index) => (
                                <Marker key={index} position={[airport.lat, airport.lng]} icon={airportIcon}>
                                    <Popup>
                                        <div className="text-center py-2 px-2 min-w-[150px]">
                                            <p className="font-bold text-gray-800 text-sm">{airport.name}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* Live Shuttle Marker */}
                            {shuttleLocation && (
                                <Marker position={[shuttleLocation.lat, shuttleLocation.lng]} icon={shuttleIcon}>
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-bold text-primary-600">Shuttle Update</p>
                                            <p className="text-xs text-gray-500">Speed: 45 km/h</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </motion.div>

                    {/* Bottom Row: Controls & 4. Visual Seat Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Track Trip Control */}
                        <div className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-6 border border-gray-700/50">
                            <h3 className="text-lg font-bold text-darktext mb-4">Start Tracking</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Trip ID..."
                                    value={tripId}
                                    onChange={(e) => setTripId(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-darkcard text-darktext focus:ring-2 focus:ring-primary-500/50 outline-none"
                                />
                                <button
                                    onClick={handleJoinTrip}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 rounded-xl font-semibold transition-colors"
                                >
                                    Go
                                </button>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                                <span className={`w-2 h-2 rounded-full ${trackingActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                                {trackingActive ? 'Live Tracking Active' : 'Not Tracking'}
                            </div>
                        </div>

                        {/* 4. Visual Seat Layout */}
                        <div className="bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg p-6 border border-gray-700/50">
                            <h3 className="text-lg font-bold text-darktext mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-secondary-400" /> Live Seat Map
                            </h3>
                            <div className="grid grid-cols-5 gap-2 max-w-[250px] mx-auto bg-gray-800 p-4 rounded-xl border border-gray-700">
                                {DUMMY_SEATS.map((seat, idx) => {
                                    if (seat.type === 'aisle') return <div key={idx} className="w-8"></div>;

                                    let colorClass = 'bg-gray-600 cursor-not-allowed'; // Booked
                                    if (seat.status === 'available') colorClass = 'bg-green-500 hover:bg-green-400 cursor-pointer';
                                    if (seat.status === 'reserved') colorClass = 'bg-red-500 cursor-not-allowed';

                                    return (
                                        <div
                                            key={idx}
                                            className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-105`}
                                            title={`Seat ${seat.id}: ${seat.status}`}
                                        >
                                            {seat.id}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Free</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-600 rounded-full"></div> Booked</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Reserved</span>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </motion.div>
    );
};

export default PassengerDashboard;
