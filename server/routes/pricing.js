const express = require('express');
const router = express.Router();
const PricingRule = require('../models/PricingRule');
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');

// @route   GET api/pricing
// @desc    Get all pricing rules
// @access  Public (or Admin only? making it public for app to calculate fare)
router.get('/', async (req, res) => {
    try {
        const rules = await PricingRule.find({});
        res.json(rules);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/pricing
// @desc    Update or Create pricing rule for a vehicle type
// @access  Admin
router.put('/', [auth, verifyAdmin], async (req, res) => {
    const { vehicleType, baseFare, pricePerKm, pricePerMinute, peakMultiplier, isActive } = req.body;

    try {
        let rule = await PricingRule.findOne({ vehicleType });

        if (rule) {
            // Update
            rule.baseFare = baseFare;
            rule.pricePerKm = pricePerKm;
            rule.pricePerMinute = pricePerMinute;
            rule.peakMultiplier = peakMultiplier;
            rule.isActive = isActive;
            rule.lastUpdated = Date.now();
        } else {
            // Create
            rule = new PricingRule({
                vehicleType,
                baseFare,
                pricePerKm,
                pricePerMinute,
                peakMultiplier,
                isActive
            });
        }

        await rule.save();
        res.json(rule);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
