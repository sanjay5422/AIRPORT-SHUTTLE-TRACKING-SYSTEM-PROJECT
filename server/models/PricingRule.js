const mongoose = require('mongoose');

const PricingRuleSchema = new mongoose.Schema({
    vehicleType: {
        type: String,
        required: true,
        unique: true // One rule per vehicle type
    },
    baseFare: {
        type: Number,
        required: true,
        default: 0
    },
    pricePerKm: {
        type: Number,
        required: true,
        default: 0
    },
    pricePerMinute: {
        type: Number,
        required: true,
        default: 0
    },
    peakMultiplier: {
        type: Number,
        default: 1 // 1 means no surge
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PricingRule', PricingRuleSchema);
