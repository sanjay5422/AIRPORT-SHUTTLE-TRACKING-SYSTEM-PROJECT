const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shuttle: {
        type: mongoose.Schema.Types.ObjectId, // Optional if we link driver to shuttle in User model, but good to have here
        ref: 'Shuttle'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    route: {
        origin: {
            lat: Number,
            lng: Number,
            address: String
        },
        destination: {
            lat: Number,
            lng: Number,
            address: String
        }
    },
    currentLocation: {
        lat: Number,
        lng: Number
    }
});

module.exports = mongoose.model('Trip', TripSchema);
