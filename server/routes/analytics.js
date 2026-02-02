const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');

// @route   GET api/analytics/dashboard
// @desc    Get dashboard stats
// @access  Admin
router.get('/dashboard', [auth, verifyAdmin], async (req, res) => {
    try {
        // 1. Total Revenue
        const payments = await Payment.find({ status: 'COMPLETED' });
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        // 2. Booking Stats
        const totalBookings = await Booking.countDocuments();
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        const activeBookings = await Booking.countDocuments({ status: 'booked' });

        // 3. User Stats
        const totalPassengers = await User.countDocuments({ role: 'PASSENGER' });
        const totalDrivers = await User.countDocuments({ role: 'DRIVER' });

        // 4. Fleet Stats
        const totalVehicles = await Vehicle.countDocuments();
        const activeVehicles = await Vehicle.countDocuments({ status: 'Active' });

        // 5. Revenue Trend (Simple Mock for last 7 days - ideally use aggregation)
        // For now returning simple data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Aggregation for revenue by day
        const revenueTrend = await Payment.aggregate([
            {
                $match: {
                    status: 'COMPLETED',
                    transactionDate: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$transactionDate" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            revenue: {
                total: totalRevenue,
                trend: revenueTrend
            },
            bookings: {
                total: totalBookings,
                completed: completedBookings,
                cancelled: cancelledBookings,
                active: activeBookings
            },
            users: {
                passengers: totalPassengers,
                drivers: totalDrivers
            },
            fleet: {
                total: totalVehicles,
                active: activeVehicles
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
