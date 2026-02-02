const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    departureTime: {
        type: String, // HH:mm format, e.g., "08:30"
        required: true
    },
    arrivalTime: {
        type: String // Estimated
    },
    days: {
        type: [String], // ["MON", "TUE", ...]
        default: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    },
    assignedShuttleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shuttle'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
