const mongoose = require('mongoose');

const LiveLocationSchema = new mongoose.Schema({
    shuttleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shuttle',
        required: true,
        unique: true // One entry per shuttle
    },
    location: {
        lat: Number,
        lng: Number,
        heading: Number,
        speed: Number
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
        index: { expires: '24h' } // Auto-delete after 24 hours if not updated (optional cleanup)
    }
});

module.exports = mongoose.model('LiveLocation', LiveLocationSchema);
