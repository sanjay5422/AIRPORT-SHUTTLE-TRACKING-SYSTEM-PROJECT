const mongoose = require('mongoose');

const ShuttleSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Should be a user with role 'DRIVER'
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    currentLocation: {
        lat: Number,
        lng: Number
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'MAINTENANCE'],
        default: 'AVAILABLE'
    },
    lastPing: {
        type: Date
    }
});

module.exports = mongoose.model('Shuttle', ShuttleSchema);
