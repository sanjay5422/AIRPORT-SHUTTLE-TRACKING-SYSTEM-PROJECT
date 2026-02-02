const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true,
        unique: true
    },
    make: {
        type: String, // e.g. Toyota, Mercedes
        required: true
    },
    model: {
        type: String, // e.g. HiAce, Sprinter
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'CNG'],
        required: true
    },
    isAC: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'UNDER_MAINTENANCE', 'RETIRED'],
        default: 'ACTIVE'
    },
    lastMaintenanceDate: {
        type: Date
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
