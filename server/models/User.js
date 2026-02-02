const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['PASSENGER', 'DRIVER', 'ADMIN', 'passenger', 'driver', 'admin'],
        default: 'PASSENGER'
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'],
        default: 'APPROVED'
    },
    refreshToken: {
        type: String
    },
    phone: {
        type: String
    },
    emergencyContact: {
        name: String,
        phone: String
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
