const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // e.g., "Airport to City Center"
        unique: true
    },
    startPoint: {
        name: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    endPoint: {
        name: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    stops: [{
        name: String,
        coordinates: {
            lat: Number,
            lng: Number
        },
        order: Number
    }],
    distanceKm: Number,
    estimatedDurationMins: Number,
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Route', RouteSchema);
