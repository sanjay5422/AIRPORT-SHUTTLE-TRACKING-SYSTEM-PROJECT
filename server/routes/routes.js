const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const AuditLog = require('../models/AuditLog');

// @route   GET api/routes
// @desc    Get all active routes
// @access  Public
router.get('/', async (req, res) => {
    try {
        const routes = await Route.find({ status: 'ACTIVE' });
        res.json(routes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/routes
// @desc    Create a new route
// @access  Admin
router.post('/', [auth, verifyAdmin], async (req, res) => {
    try {
        const { name, startPoint, endPoint, stops, distanceKm, estimatedDurationMins } = req.body;

        let route = await Route.findOne({ name });
        if (route) return res.status(400).json({ msg: 'Route with this name already exists' });

        route = new Route({
            name,
            startPoint,
            endPoint,
            stops,
            distanceKm,
            estimatedDurationMins,
            createdBy: req.user.id
        });

        await route.save();

        // Audit Log
        const log = new AuditLog({
            adminId: req.user.id,
            action: 'CREATE_ROUTE',
            targetId: route.id,
            targetModel: 'Route',
            details: { name }
        });
        await log.save();

        res.json(route);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/routes/schedule
// @desc    Add a schedule to a route
// @access  Admin
router.post('/schedule', [auth, verifyAdmin], async (req, res) => {
    try {
        const { routeId, departureTime, days, assignedShuttleId } = req.body;

        const schedule = new Schedule({
            routeId,
            departureTime,
            days,
            assignedShuttleId
        });

        await schedule.save();
        res.json(schedule);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/routes/schedules/:routeId
// @desc    Get schedules for a route
// @access  Public
router.get('/schedules/:routeId', async (req, res) => {
    try {
        const schedules = await Schedule.find({ routeId: req.params.routeId, isActive: true })
            .populate('assignedShuttleId')
            .sort({ departureTime: 1 });
        res.json(schedules);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
