const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const User = require('../models/User');

// @route   POST api/trips/start
// @desc    Start a new trip (Driver only)
// @access  Private
router.post('/start', auth, async (req, res) => {
    if (req.user.role !== 'driver') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    try {
        // Check if driver has active trip
        const activeTrip = await Trip.findOne({ driver: req.user.id, status: 'active' });
        if (activeTrip) {
            return res.status(400).json({ msg: 'You already have an active trip' });
        }

        const { shuttleId, origin, destination } = req.body;

        const newTrip = new Trip({
            driver: req.user.id,
            shuttle: shuttleId, // Optional
            route: { origin, destination },
            currentLocation: origin // Start at origin
        });

        const trip = await newTrip.save();
        res.json(trip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/trips/end/:id
// @desc    End a trip
// @access  Private
router.put('/end/:id', auth, async (req, res) => {
    try {
        let trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: 'Trip not found' });

        if (trip.driver.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        trip.status = 'completed';
        trip.endTime = Date.now();

        await trip.save();
        res.json(trip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/trips/active
// @desc    Get all active trips (For Passengers/Admin)
// @access  Private
router.get('/active', auth, async (req, res) => {
    try {
        const trips = await Trip.find({ status: 'active' }).populate('driver', 'name');
        res.json(trips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
