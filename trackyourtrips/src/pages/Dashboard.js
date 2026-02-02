import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, ShieldCheck, BusFront, Plane } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion } from 'framer-motion';

// Import Role-Based Dashboards
import PassengerDashboard from '../components/dashboard/PassengerDashboard';
import DriverDashboard from '../components/dashboard/DriverDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const socket = io('http://localhost:5000');

const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const [activeTrip, setActiveTrip] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const locationInterval = useRef(null);

    // Socket Connection Management
    useEffect(() => {
        if (!user) return;
        // console.log("Socket connected for user:", user.role);
    }, [user]);

    const startTrip = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/trips/start', {
                origin: { lat: 51.505, lng: -0.09 },
                destination: { lat: 51.515, lng: -0.1 }
            }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setActiveTrip(res.data);
            socket.emit('join-trip', res.data._id);
            alert('Trip Started! Simulating movement...');
            simulateMovement(res.data._id);
        } catch (err) {
            alert('Error starting trip: ' + (err.response?.data?.msg || err.message));
        }
    };

    const simulateMovement = (tripId) => {
        let lat = 51.505;
        let lng = -0.09;

        locationInterval.current = setInterval(() => {
            lat += 0.0001;
            lng += 0.0001;
            const newLoc = { lat, lng };
            setDriverLocation(newLoc);

            socket.emit('driver-location', {
                tripId,
                location: newLoc,
                driverId: user._id
            });
        }, 3000);
    };

    const stopTrip = async () => {
        if (locationInterval.current) clearInterval(locationInterval.current);
        if (activeTrip) {
            await axios.put(`http://localhost:5000/api/trips/end/${activeTrip._id}`, {}, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setActiveTrip(null);
            setDriverLocation(null);
            alert('Trip Ended');
        }
    };

    const joinTrip = (tripId) => {
        if (!tripId) return alert("Please enter a Trip ID");
        socket.emit('join-trip', tripId);
        alert('Tracking Trip: ' + tripId);
    };

    const DashboardHeader = ({
        title,
        subtitle,
        icon: Icon,
        role
    }) => (
        <motion.header
            className="mb-8 p-6 bg-darksurface/80 backdrop-blur-xl rounded-2xl shadow-glass-lg flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-700/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="p-3 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-md">
                    <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-darktext mb-1">{title}</h1>
                    <p className="text-gray-400 text-md">{subtitle}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-primary-300 bg-primary-950/50 px-4 py-2 rounded-full text-sm font-semibold shadow-inner border border-primary-700">
                {role === 'passenger' && <Plane className="w-4 h-4 text-primary-300" />}
                {role === 'driver' && <BusFront className="w-4 h-4 text-primary-300" />}
                {role === 'admin' && <ShieldCheck className="w-4 h-4 text-primary-300" />}
                {role === 'passenger' && 'Traveller Dashboard'}
                {role === 'driver' && 'Driver Dashboard'}
                {role === 'admin' && 'Administrator Dashboard'}
            </div>
        </motion.header>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl animate-pulse"
            >
                <div className="mb-8 p-6 bg-darksurface/80 rounded-2xl shadow-glass-lg flex items-center justify-between border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
                        <div>
                            <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-32"></div>
                        </div>
                    </div>
                    <div className="h-8 bg-gray-700 rounded-full w-40"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-darkcard/50 rounded-2xl p-6 shadow-glass border border-gray-800 h-48"></div>
                    ))}
                </div>
            </motion.div>
        </div>
    );

    if (!user) return <div className="p-10 text-center text-gray-400">Please login to view your dashboard.</div>;

    const renderDashboard = () => {
        switch (user.role) {
            case 'passenger':
                return <PassengerDashboard socket={socket} user={user} joinTrip={joinTrip} />;
            case 'driver':
                return (
                    <DriverDashboard
                        activeTrip={activeTrip}
                        startTrip={startTrip}
                        stopTrip={stopTrip}
                        driverLocation={driverLocation}
                    />
                );
            case 'admin':
                return <AdminDashboard />;
            default:
                return <div className="text-center text-gray-400">Unknown user role.</div>;
        }
    };

    const getDashboardHeaderProps = () => {
        switch (user.role) {
            case 'passenger':
                return { title: 'Passenger Dashboard', subtitle: 'Your journey at a glance', icon: Plane, role: 'passenger' };
            case 'driver':
                return { title: 'Driver Operations', subtitle: 'Manage your trips and routes', icon: BusFront, role: 'driver' };
            case 'admin':
                return { title: 'Admin Control Panel', subtitle: 'Manage users, trips, and system settings', icon: ShieldCheck, role: 'admin' };
            default:
                return { title: 'Dashboard', subtitle: 'Welcome', icon: User, role: 'user' };
        }
    };

    return (
        <motion.div
            className="container mx-auto px-4 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <DashboardHeader {...getDashboardHeaderProps()} />
            <div className="content-area">
                {renderDashboard()}
            </div>
        </motion.div>
    );
};

export default Dashboard;
