const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');

// @route   GET api/admin/stats
// @desc    Get dashboard stats
// @access  Private (Admin)
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const totalPassengers = await User.countDocuments({ role: 'passenger' });
        const totalDrivers = await User.countDocuments({ role: 'driver' });
        const activeTrips = await Trip.countDocuments({ status: 'active' });

        const completedBookings = await Booking.find({ paymentStatus: 'paid' });
        const totalRevenue = completedBookings.reduce((acc, curr) => acc + curr.amount, 0);

        // Daily revenue for chart (simplified)
        const revenueData = [
            { name: 'Mon', revenue: 4000 },
            { name: 'Tue', revenue: 3000 },
            { name: 'Wed', revenue: 5000 },
            { name: 'Fri', revenue: 1890 },
        ];

        res.json({
            totalPassengers,
            totalDrivers,
            activeTrips,
            totalRevenue,
            revenueData
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/driver/:id/toggle
// @desc    Enable/Disable driver
// @access  Private (Admin)
router.put('/driver/:id/toggle', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'driver') return res.status(404).json({ msg: 'Driver not found' });

        user.isActive = !user.isActive;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/export
// @desc    Export bookings (JSON for CSV)
// @access  Private (Admin)
router.get('/export', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const bookings = await Booking.find().populate('passenger', 'name email').populate('trip');
        const csvData = bookings.map(b => ({
            BookingID: b._id,
            Passenger: b.passenger ? b.passenger.name : 'Unknown',
            Email: b.passenger ? b.passenger.email : 'Unknown',
            Amount: b.amount,
            Status: b.status,
            Date: b.bookingDate,
            TripID: b.trip ? b.trip._id : 'N/A'
        }));

        res.json(csvData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
