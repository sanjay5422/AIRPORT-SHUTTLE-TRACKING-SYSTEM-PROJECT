const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const Shuttle = require('../models/Shuttle');
const AuditLog = require('../models/AuditLog');

// @route   GET api/fleet/vehicles
// @desc    Get all vehicles
// @access  Admin/Driver
router.get('/vehicles', auth, async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ registrationDate: -1 });
        res.json(vehicles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/fleet/vehicles
// @desc    Add a new vehicle
// @access  Admin
router.post('/vehicles', [auth, verifyAdmin], async (req, res) => {
    try {
        const { vehicleNumber, make, model, capacity, fuelType, isAC } = req.body;

        let vehicle = await Vehicle.findOne({ vehicleNumber });
        if (vehicle) return res.status(400).json({ msg: 'Vehicle already exists' });

        vehicle = new Vehicle({
            vehicleNumber,
            make,
            model,
            capacity,
            fuelType,
            isAC
        });

        await vehicle.save();

        // Audit Log
        const log = new AuditLog({
            adminId: req.user.id,
            action: 'ADD_VEHICLE',
            targetId: vehicle.id,
            targetModel: 'Vehicle',
            details: { vehicleNumber, make, model }
        });
        await log.save();

        res.json(vehicle);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/fleet/shuttles
// @desc    Get all shuttles (active assignments)
// @access  Public (for now) / Private
router.get('/shuttles', async (req, res) => {
    try {
        const shuttles = await Shuttle.find()
            .populate('vehicleId')
            .populate('driverId', 'name')
            .populate('routeId', 'name'); // Assuming route model exists or will exist
        res.json(shuttles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/fleet/shuttles/assign
// @desc    Assign driver/vehicle to shuttle duty (Create/Update Shuttle entry)
// @access  Admin
router.post('/shuttles/assign', [auth, verifyAdmin], async (req, res) => {
    try {
        const { vehicleId, driverId, routeId } = req.body;

        // Check if vehicle is already assigned
        let existingShuttle = await Shuttle.findOne({ vehicleId });
        if (existingShuttle) {
            existingShuttle.driverId = driverId;
            existingShuttle.routeId = routeId;
            existingShuttle.status = 'AVAILABLE';
            await existingShuttle.save();
            return res.json(existingShuttle);
        }

        const newShuttle = new Shuttle({
            vehicleId,
            driverId,
            routeId,
            status: 'AVAILABLE'
        });

        await newShuttle.save();
        res.json(newShuttle);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
