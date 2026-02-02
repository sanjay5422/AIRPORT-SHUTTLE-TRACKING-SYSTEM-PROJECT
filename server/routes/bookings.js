const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');

// @route   GET api/bookings
// @desc    Get all bookings (Admin with filters)
// @access  Admin
router.get('/', [auth, verifyAdmin], async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = {};
        if (status && status !== 'ALL') query.status = status.toLowerCase();
        if (date) {
            const startIdx = new Date(date);
            const endIdx = new Date(date);
            endIdx.setDate(endIdx.getDate() + 1);
            query.bookingDate = { $gte: startIdx, $lt: endIdx };
        }

        const bookings = await Booking.find(query)
            .populate('passenger', 'name email')
            .populate({
                path: 'trip',
                select: 'route'
            })
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/bookings/recent
// @desc    Get last 5 bookings for user
// @access  Private
router.get('/recent', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ passenger: req.user.id })
            .sort({ bookingDate: -1 })
            .limit(5)
            .populate({
                path: 'trip',
                select: 'route'
            });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/bookings/:id/cancel
// @desc    Cancel booking (User)
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        if (booking.passenger.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({ msg: 'Cannot cancel completed trip' });
        }

        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        booking.cancelledBy = req.user.id;
        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/bookings/:id/admin-cancel
// @desc    Cancel booking (Admin Override)
// @access  Admin
router.put('/:id/admin-cancel', [auth, verifyAdmin], async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        booking.adminNotes = reason;
        booking.cancelledBy = req.user.id;
        await booking.save();

        // Audit Log
        const log = new AuditLog({
            adminId: req.user.id,
            action: 'CANCEL_BOOKING',
            targetId: booking.id,
            targetModel: 'Booking',
            details: { reason }
        });
        await log.save();

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/bookings/my-active-trip
// @desc    Get bookings for driver's current active trip
// @access  Private (Driver)
router.get('/my-active-trip', auth, async (req, res) => {
    try {
        // 1. Find active trip for driver
        const Trip = require('../models/Trip');
        // Assuming Trip model has 'driver' and 'status'
        const trip = await Trip.findOne({ driver: req.user.id, status: 'active' });

        if (!trip) {
            // Return empty array if no active trip
            return res.json([]);
        }

        // 2. Find bookings for this trip
        const bookings = await Booking.find({ trip: trip._id })
            .populate('passenger', 'name email')
            .sort({ pickupLocation: 1 }); // Simple sort, ideally sort by stop order

        // 3. (Optional) Enhance with coordinates if we had the route loaded
        // For now, return bookings
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
